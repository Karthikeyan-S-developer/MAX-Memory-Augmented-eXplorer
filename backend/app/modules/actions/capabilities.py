from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Capability:
    name: str
    enabled: bool = False
    requires_confirmation: bool = True


class CapabilityRegistry:
    def __init__(self) -> None:
        self.capabilities: list[Capability] = [
            Capability(name="notifications"),
            Capability(name="clipboard"),
            Capability(name="calendar", requires_confirmation=True),
        ]

    def list_capabilities(self) -> list[Capability]:
        return self.capabilities
