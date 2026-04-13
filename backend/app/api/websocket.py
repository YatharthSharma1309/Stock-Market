import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.market import get_quotes_batch

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await websocket.accept()
    symbols: list[str] = []
    try:
        # First message must be subscription: {"symbols": ["AAPL", "TCS.NS"]}
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=10)
        msg = json.loads(raw)
        symbols = [s.upper() for s in msg.get("symbols", [])]

        while True:
            if symbols:
                loop = asyncio.get_running_loop()
                quotes = await loop.run_in_executor(None, get_quotes_batch, symbols)
                await websocket.send_json({"type": "price_update", "data": quotes})
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        pass
    except asyncio.TimeoutError:
        await websocket.close()
    except Exception:
        pass
