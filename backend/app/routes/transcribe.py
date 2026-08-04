from __future__ import annotations

import requests
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class TranscribeResponse(BaseModel):
    transcript: str


def build_transcription_error_message(api_key: str | None) -> str:
    if not api_key:
        return "Speech transcription is not configured. Set OPENAI_API_KEY in the backend environment."
    return "Speech transcription failed."


@router.post("", response_model=TranscribeResponse)
async def transcribe_audio(file: UploadFile = File(...)) -> TranscribeResponse:
    api_key = settings.openai_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail=build_transcription_error_message(api_key))

    try:
        audio_bytes = await file.read()
        filename = file.filename or "voice.m4a"
        content_type = file.content_type or "audio/m4a"
        files = {"file": (filename, audio_bytes, content_type)}
        data = {"model": settings.openai_transcription_model}
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {api_key}"},
            files=files,
            data=data,
            timeout=120,
        )
        response.raise_for_status()
        payload = response.json()
        transcript = payload.get("text") or ""
        return TranscribeResponse(transcript=transcript)
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"{build_transcription_error_message(api_key)} {exc}") from exc
