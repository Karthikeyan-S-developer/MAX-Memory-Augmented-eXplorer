# Installation guide

## Backend

1. Create a Python environment.
2. Install dependencies: `pip install -r requirements.txt`.
3. Start the API: `uvicorn app.main:app --reload` from the backend folder.

## Frontend

1. Install JS dependencies: `npm install` inside the frontend folder.
2. Start Expo: `npx expo start`.
3. Use Expo Go or an Android emulator.

## Notes

- The app expects the backend at `http://127.0.0.1:8000` by default.
- For Android emulators or physical devices, point `EXPO_PUBLIC_API_URL` to your computer's LAN IP.
