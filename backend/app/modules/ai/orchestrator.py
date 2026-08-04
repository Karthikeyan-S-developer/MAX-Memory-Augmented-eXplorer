from __future__ import annotations

from app.modules.ai.reasoning_engine import ReasoningEngine
from app.modules.ai.providers.ollama_provider import OllamaProvider
from app.modules.memory.memory_service import MemoryService


class AIOrchestrator:
    def __init__(self) -> None:
        self.provider = OllamaProvider()
        self.reasoning_engine = ReasoningEngine()
        self.memory_service = MemoryService()

    def handle_message(self, message: str, conversation_id: str | None = None) -> tuple[str, str]:
        conversation_id = conversation_id or "default"
        self.memory_service.add_memory(message, importance=0.4)
        reasoning = self.reasoning_engine.reason(message)
        reply = self.provider.generate(reasoning)
        return reply, conversation_id
