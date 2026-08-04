from __future__ import annotations


class ReasoningEngine:
    def reason(self, message: str) -> str:
        return (
            "You are MAX, a calm and helpful AI companion. "
            f"Reason about the user's request and respond naturally: {message}"
        )
