from __future__ import annotations

from dataclasses import dataclass


@dataclass
class MemoryRecord:
    content: str
    importance: float


class MemoryService:
    def __init__(self) -> None:
        self.records: list[MemoryRecord] = []

    def add_memory(self, content: str, importance: float) -> dict[str, object]:
        self.records.append(MemoryRecord(content=content, importance=importance))
        return {"status": "stored", "count": len(self.records)}

    def list_memories(self) -> list[dict[str, object]]:
        return [
            {"content": record.content, "importance": record.importance}
            for record in self.records
        ]
