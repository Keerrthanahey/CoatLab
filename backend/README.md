# CoatLab Backend

FastAPI backend for the CoatLab Materials Intelligence Platform.

## Setup

```bash
cd backend
cp .env.example .env          # edit as needed
pip install -r requirements.txt
uvicorn app.main:app --reload  # dev server on http://localhost:8000
```

## Docker

```bash
docker build -t coatlab-api .
docker run -p 8000:8000 -e PORT=8000 coatlab-api
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ALLOWED_ORIGINS` | `http://localhost:3333` | Comma-separated CORS origins |
| `PORT` | `8000` | Port for uvicorn (Docker only) |
