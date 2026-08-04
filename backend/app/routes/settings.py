from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SettingsPayload(BaseModel):
    assistant_name: str = "MAX"
    voice: str = "default"
    wake_word: str = "MAX"
    theme: str = "dark"


@router.get("")
def get_settings() -> SettingsPayload:
    return SettingsPayload()


@router.post("")
def save_settings(payload: SettingsPayload) -> SettingsPayload:
    return payload
