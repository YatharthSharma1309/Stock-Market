import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ai import AIConversation
from app.schemas.ai import ChatRequest, HistoryMessageOut
from app.services.ai import (
    get_client, build_system_prompt,
    MODEL, MAX_TOKENS, HISTORY_LIMIT, HISTORY_STORE,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])
logger = logging.getLogger(__name__)


@router.post("/chat")
async def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not get_client().api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    # Persist user message
    user_msg = AIConversation(
        user_id=current_user.id, role="user", content=req.message.strip()
    )
    db.add(user_msg)
    db.commit()

    # Load rolling history for Claude context (newest first, then reverse)
    history_rows = (
        db.query(AIConversation)
        .filter(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.created_at.desc())
        .limit(HISTORY_LIMIT)
        .all()
    )
    messages = [
        {"role": m.role, "content": m.content}
        for m in reversed(history_rows)
    ]

    system_prompt = build_system_prompt(current_user, req.context, db)

    async def generate():
        full_response: list[str] = []
        try:
            async with get_client().messages.stream(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=system_prompt,
                messages=messages,
            ) as stream:
                async for text in stream.text_stream:
                    full_response.append(text)
                    yield f"data: {json.dumps({'type': 'delta', 'text': text})}\n\n"

        except Exception as e:
            logger.error(f"Claude API error for user {current_user.id}: {e}")
            yield f"data: {json.dumps({'type': 'error', 'detail': 'AI service unavailable. Please try again.'})}\n\n"
            yield "data: [DONE]\n\n"
            return

        # Persist assistant reply
        content = "".join(full_response)
        assistant_msg = AIConversation(
            user_id=current_user.id, role="assistant", content=content
        )
        db.add(assistant_msg)
        db.commit()

        # Prune to HISTORY_STORE most recent messages
        all_ids = (
            db.query(AIConversation.id)
            .filter(AIConversation.user_id == current_user.id)
            .order_by(AIConversation.created_at.desc())
            .all()
        )
        if len(all_ids) > HISTORY_STORE:
            old_ids = [r.id for r in all_ids[HISTORY_STORE:]]
            db.query(AIConversation).filter(AIConversation.id.in_(old_ids)).delete(
                synchronize_session=False
            )
            db.commit()

        yield f"data: {json.dumps({'type': 'done', 'message_id': str(assistant_msg.id)})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history", response_model=list[HistoryMessageOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(AIConversation)
        .filter(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.created_at.asc())
        .limit(HISTORY_STORE)
        .all()
    )
    return [
        HistoryMessageOut(role=r.role, content=r.content, created_at=r.created_at)
        for r in rows
    ]


@router.delete("/history", status_code=204)
def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).delete(synchronize_session=False)
    db.commit()
