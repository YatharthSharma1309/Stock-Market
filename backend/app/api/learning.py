from datetime import date, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.learning import LessonProgress
from app.schemas.learning import ProgressOut, ModuleProgressOut, CompletionOut

router = APIRouter(prefix="/api/learning", tags=["learning"])


def _compute_streak(rows: list[LessonProgress]) -> int:
    if not rows:
        return 0
    completed_dates = sorted(
        {r.completed_at.astimezone(timezone.utc).date() for r in rows},
        reverse=True,
    )
    today = date.today()
    streak = 0
    for i, d in enumerate(completed_dates):
        if d == today - timedelta(days=i):
            streak += 1
        else:
            break
    return streak


@router.get("/progress", response_model=ProgressOut)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id
    ).all()
    ids = [r.lesson_id for r in rows]
    return ProgressOut(
        completed_lesson_ids=ids,
        total_completed=len(ids),
        streak_days=_compute_streak(rows),
    )


@router.get("/progress/{module_id}", response_model=ModuleProgressOut)
def get_module_progress(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # lesson_id pattern for a module: starts with the module prefix
    # e.g. module_id "technical-analysis" → lessons "ta-lesson-1" etc.
    # We store all lesson IDs and filter by module prefix in the response
    rows = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id
    ).all()
    # Return all IDs; frontend filters by module
    return ModuleProgressOut(
        module_id=module_id,
        completed_lesson_ids=[r.lesson_id for r in rows],
    )


@router.post("/complete/{lesson_id}", response_model=CompletionOut)
def complete_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not lesson_id.strip():
        raise HTTPException(status_code=400, detail="Invalid lesson ID")

    existing = db.query(LessonProgress).filter_by(
        user_id=current_user.id, lesson_id=lesson_id
    ).first()
    if existing:
        return CompletionOut(
            lesson_id=lesson_id,
            completed_at=existing.completed_at,
            already_completed=True,
        )

    row = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return CompletionOut(
        lesson_id=lesson_id,
        completed_at=row.completed_at,
        already_completed=False,
    )
