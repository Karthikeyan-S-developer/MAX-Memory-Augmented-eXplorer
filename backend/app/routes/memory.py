from fastapi import APIRouter
from pydantic import BaseModel

from app.modules.memory.memory_service import MemoryService

router = APIRouter()
memory_service = MemoryService()


class MemoryItem(BaseModel):
    content: str
    importance: float = 0.5


@router.get("")
def list_memories() -> list[dict[str, object]]:
    return memory_service.list_memories()


@router.post("")
def add_memory(item: MemoryItem) -> dict[str, object]:
    return memory_service.add_memory(item.content, item.importance)
