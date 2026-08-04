from __future__ import annotations

import requests

from app.core.config import settings


class OllamaProvider:
    def __init__(self) -> None:
        self.base_url = settings.ollama_base_url

    def _get_available_models(self) -> list[str]:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            payload = response.json()
            models = payload.get("models", [])
            return [model.get("name", "") for model in models if model.get("name")]
        except Exception:
            return []

    def _select_model(self) -> str:
        if settings.default_model:
            return settings.default_model

        models = self._get_available_models()
        if not models:
            return ""
        return models[0]

    def generate(self, prompt: str) -> str:
        model = self._select_model()
        if not model:
            return "Ollama is not running or no local models are installed."

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "I’m here and ready to help.")
        except Exception as exc:
            return f"Ollama request failed: {exc}"
