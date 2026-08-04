from fastapi import APIRouter
from pydantic import BaseModel

from app.modules.ai.orchestrator import AIOrchestrator

router = APIRouter()
orchestrator = AIOrchestrator()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    reply, conversation_id = orchestrator.handle_message(request.message, request.conversation_id)
    return ChatResponse(reply=reply, conversation_id=conversation_id)
