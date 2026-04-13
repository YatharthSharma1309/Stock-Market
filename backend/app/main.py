from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import auth, health, market, websocket

app = FastAPI(
    title="StockSim Pro API",
    description="Stock market simulator backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(health.router)
app.include_router(market.router)
app.include_router(websocket.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
