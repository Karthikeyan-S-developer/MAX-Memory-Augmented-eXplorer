# Development guide

## Backend workflow

- Run the API with `python -m uvicorn backend.app.main:app --reload --port 8000`.
- Add new routes under the backend/app/routes directory.
- Keep business logic inside modules and keep routes thin.

## Frontend workflow

- Install dependencies: `npm install` in the frontend directory.
- Start Expo: `npx expo start`.
- Use the Expo Go app or an emulator.

## Testing

- Backend: `python -m pytest backend/tests -q`
- Frontend: add React Native tests as the app grows.
