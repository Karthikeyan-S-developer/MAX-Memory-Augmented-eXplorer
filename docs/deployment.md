# Production deployment guide

## Backend

- Containerize the backend with Docker using the provided docker-compose setup.
- Configure environment variables for production values.
- Use PostgreSQL and Qdrant or another vector store in a managed environment.

## Frontend

- Build an Android APK via Expo/EAS.
- Ensure the frontend uses a stable backend URL via environment configuration.
- Keep Android-specific permission and capability modules behind clear abstractions.
