"""Initial schema — all tables

Revision ID: 0001
Revises:
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("virtual_balance", sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    # ── holdings ──────────────────────────────────────────────────────────────
    op.create_table(
        "holdings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column("avg_buy_price", sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_holdings_user_id"), "holdings", ["user_id"], unique=False)

    # ── trades ────────────────────────────────────────────────────────────────
    op.create_table(
        "trades",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("trade_type", sa.String(), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column("price", sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column("total_value", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_trades_user_id"), "trades", ["user_id"], unique=False)

    # ── lesson_progress ───────────────────────────────────────────────────────
    op.create_table(
        "lesson_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", sa.String(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )
    op.create_index(
        op.f("ix_lesson_progress_user_id"), "lesson_progress", ["user_id"], unique=False
    )

    # ── ai_conversations ──────────────────────────────────────────────────────
    op.create_table(
        "ai_conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_ai_conv_user_created",
        "ai_conversations",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_ai_conv_user_created", table_name="ai_conversations")
    op.drop_table("ai_conversations")

    op.drop_index(op.f("ix_lesson_progress_user_id"), table_name="lesson_progress")
    op.drop_table("lesson_progress")

    op.drop_index(op.f("ix_trades_user_id"), table_name="trades")
    op.drop_table("trades")

    op.drop_index(op.f("ix_holdings_user_id"), table_name="holdings")
    op.drop_table("holdings")

    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
