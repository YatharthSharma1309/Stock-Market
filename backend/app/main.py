from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, health, market, websocket, portfolio, learning, ai
from app.api import leaderboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="StockSim Pro API",
    description="Stock market simulator backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({settings.FRONTEND_URL, "http://localhost:3000", "http://localhost"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(health.router)
app.include_router(market.router)
app.include_router(websocket.router)
app.include_router(portfolio.router)
app.include_router(learning.router)
app.include_router(ai.router)
app.include_router(leaderboard.router)
