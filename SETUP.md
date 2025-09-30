Setup & Deployment
==================

Environment
-----------
Create a `.env` file in the `backend` folder (do NOT commit this file). At minimum set:

```
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

The project already includes a `.env.example` — copy that to `backend/.env` and fill your keys.

Running locally
----------------
Start backend:

```powershell
cd backend
npm install
npm run dev
```

Start frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 (or the port Vite tells you).

Continuous Integration
----------------------
A GitHub Actions workflow is included at `.github/workflows/ci.yml`. It will:

- Install backend and frontend dependencies
- Run backend tests (if present)
- Build the frontend and upload `frontend/dist` as an artifact

If your CI needs to call the Gemini API, add `GEMINI_API_KEY` as a repository secret in GitHub (Settings → Secrets → Actions) and expose it to workflows as needed.

Notes
-----
- Avoid committing `backend/.env` or any API keys. `.gitignore` has been updated to exclude `.env` and `frontend/dist`.
- If you want, I can add a simple deployment workflow to publish the frontend to GitHub Pages or Vercel.
