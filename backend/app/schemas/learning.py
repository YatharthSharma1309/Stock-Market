from datetime import datetime
from pydantic import BaseModel


class ProgressOut(BaseModel):
    completed_lesson_ids: list[str]
    total_completed: int
    streak_days: int


class ModuleProgressOut(BaseModel):
    module_id: str
    completed_lesson_ids: list[str]


class CompletionOut(BaseModel):
    lesson_id: str
    completed_at: datetime
    already_completed: bool
