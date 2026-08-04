# MAX architecture overview

MAX is structured as a layered platform:

- Frontend: React Native + Expo + TypeScript shell for chat, voice, memory viewing, and settings.
- Backend: FastAPI services for chat orchestration, memory, settings, and future plugin actions.
- AI layer: provider abstraction for local and cloud LLMs with a reasoning pipeline.
- Memory layer: layered memory service with working, episodic, semantic, procedural, and long-term memory concepts.
- Actions layer: capability-based execution pipeline that requires explicit confirmation for sensitive actions.

## Extension points

- Add providers by implementing the provider interface.
- Add plugins by extending the action capability registry.
- Swap persistence engines by introducing repository abstractions.
