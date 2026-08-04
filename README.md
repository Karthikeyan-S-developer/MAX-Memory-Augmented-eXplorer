# MAX

MAX (Memory Augmented eXplorer) is a modular, production-oriented personal AI companion platform.

## Architecture

- Frontend: React Native + Expo + TypeScript
- Backend: FastAPI + Python
- Memory: layered memory service with retrieval and consolidation
- AI: provider abstraction for Ollama, OpenAI, Anthropic, and future models
- Device actions: capability-based action layer with explicit confirmation

## Structure

- frontend: React Native application shell and chat UI
- backend: FastAPI services, reasoning pipeline, memory services, and plugins
- shared: cross-cutting type definitions
- docs: architecture, installation, deployment, and API references

## Quick start

1. Copy .env.example to .env and adjust local values.
2. Start the backend with `python -m uvicorn app.main:app --reload` from the backend folder.
3. Start the frontend with `npm install && npx expo start` from the frontend folder.
