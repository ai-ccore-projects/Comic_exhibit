# Comic Generator (FastAPI + React)

A small monorepo for a camera-driven comic generator. The backend is a FastAPI server that talks to generative AI (Gemini/OpenAI). The frontend (`kiosk/`) is a Vite + React app that captures images, takes a short prompt, and asks the backend to generate or edit a single‑page comic in a chosen artist style.

## Repo Layout

```
.
├─ Backend/           # FastAPI app
├─ kiosk/             # Vite + React frontend
└─ README.md
```

## Prerequisites

- **Python 3.11+** (working with Python 3.13)
- **Node.js 18+** (20+ recommended) and **npm**
- macOS/Linux shell (zsh/bash) or Windows WSL
- A **Gemini API key** (and optionally an OpenAI API key)

## Quick Start

### 1) Backend

```bash
cd Backend

# Create & activate virtualenv  ✅ IMPORTANT: use 'source', not './'
python3 -m venv .venv
source .venv/bin/activate

# Install deps
pip install -r requirements.txt

# (Optional) copy env template
cp .env.example .env
# then edit .env with your keys (see "Environment Variables" below)

# Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2) Frontend (kiosk)

```bash
cd kiosk
npm install
npm run dev -- --port 5173
```

Open the printed local URL (e.g. http://localhost:5173).  
If the backend runs on a different host/port, set `VITE_BACKEND_URL` in `kiosk/.env`:

```
VITE_BACKEND_URL=http://localhost:8000
```

## Environment Variables

Create `Backend/.env` and fill in the following:

```
# Google Gemini
GEMINI_API_KEY=your_gemini_key_here

# (Optional) OpenAI
OPENAI_API_KEY=your_openai_key_here

# CORS (leave empty to allow all during local dev)
ALLOWED_ORIGINS=
```

> Tip: In production, restrict `ALLOWED_ORIGINS` (comma‑separated) to your actual domains.

### Example `.env.example`
```
GEMINI_API_KEY=
OPENAI_API_KEY=
ALLOWED_ORIGINS=
```

## API (current endpoints used by the kiosk)

> These are the routes typically used by the current UI. If you change them in code, update here too.

- `GET /ping` — simple health check.
- `POST /api/generate` — generate a comic image from a captured photo + prompt + style.
- `POST /api/edit` — refine/edit the previously generated image with a new prompt.
  - `multipart/form-data`
    - `image_file`: the source image (PNG/JPEG)
    - `prompt`: refinement instructions (string)

> Your frontend’s “refine” flow currently posts to `/api/edit` with `image_file` and `prompt`.

## Common Tasks

**Run FastAPI on a different port**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 9000
```

**Update Python packages**
```bash
pip install --upgrade pip
pip install -r requirements.txt --upgrade
```

**Build a production frontend**
```bash
cd kiosk
npm run build
# Preview build locally
npm run preview
```

## Troubleshooting

- **`permission denied: ./venv/bin/activate`**
  - You must *source* it to modify your current shell:
    ```bash
    source .venv/bin/activate
    ```

- **Port already in use**
  - Change the port:
    ```bash
    uvicorn main:app --port 9000
    npm run dev -- --port 5174
    ```

- **CORS errors in the browser**
  - Set `ALLOWED_ORIGINS` in `Backend/.env` to include your frontend origin (e.g., `http://localhost:5173`). During local dev, you can leave it empty to allow all (not recommended for prod).

- **Apple Silicon build issues (grpc/uvloop/etc.)**
  - Make sure Xcode CLT are installed: `xcode-select --install`
  - Keep Python up to date and prefer wheels from PyPI where possible.

## Scripts / Useful Commands

```bash
# Backend
cd Backend && source .venv/bin/activate && uvicorn main:app --reload

# Frontend
cd kiosk && npm run dev -- --port 5173
```

## Contributing

- Use feature branches and open PRs against `main`.
- Keep this README up to date when changing endpoints or environment variables.
- Prefer small, well‑named commits.

## License

MIT (or your team’s preferred license)
