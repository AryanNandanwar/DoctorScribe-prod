# DoctorScribe / EchoAide — Session Context

Living reference for AI-assisted work on this repo. Update this file when architecture, env vars, or workflows change materially.

## What this is

Clinical documentation app: doctors record patient encounters via live audio, speech is transcribed in real time, and a structured clinical note is generated (AWS Bedrock) and stored. Receptionists can register patient intake; doctors work from an intake queue on the home page.

Production domain: **https://app.echoaide.in**

## Monorepo layout

| Path | Stack | Role |
|------|--------|------|
| `backend/` | NestJS 11, TypeORM, PostgreSQL (Supabase), Socket.IO | REST API, WebSocket streaming, note generation |
| `frontend/` | React 19, Vite, MUI, Tailwind | SPA; nginx serves build in Docker |
| `docker-compose.yml` | Docker | Production: backend + nginx + certbot |
| `docker-compose.local.yml` | Docker overlay | Local HTTP on **http://localhost:8081** (no TLS) |

Global API prefix: **`/api`** (WebSocket at `/socket.io`, excluded from prefix).

## Core data flow

```
Browser (AudioRecorder / useStreamingTranscription)
  → Socket.IO: start_recording, audio chunks, stop_recording
  → StreamingWebSocketGateway → StreamingService
  → SonioxClientService (wss://stt-rt.soniox.com) — live STT
  → IncrementalNoteService (AWS Bedrock) — final structured note
  → ClinicalNotesModule — persist to Postgres
  → SSE — notify frontend when note is ready
```

Alternate path: `POST /api/upload-audio` (`AudioUploadController`) for file upload without live WebSocket.

**STT in use:** `SonioxClientService` (wired in `StreamingModule`). `SarvamClientService` exists but is not registered in the module.

## Backend modules (high level)

- **auth** — `/api/auth/login`, `/api/auth/signup`, receptionist signup; JWT (`APP_JWT_SECRET` or `JWT_SECRET`)
- **doctor** — doctor profile / related routes
- **patient** — `/api/doctor/me/patients`
- **clinical_notes** — `/api/clinical-notes`
- **intake** — `/api/intake` (receptionist queue, complete on note finish)
- **websocket** + **streaming** — recording sessions, Soniox, Bedrock
- **sse** — `/api/sse` — push when final note is available

Entities: `doctor`, `patient`, `clinical_notes`, `patient-intake`, `receptionist`.

Database: **Supabase Postgres** via `SUPABASE_DB_URL`. Do not rely on `synchronize` in production; use migrations under `backend/migrations/`.

## Frontend routes

| Route | Page |
|-------|------|
| `/` | `home.tsx` — intake queue + recording |
| `/login` | `Login.tsx` |
| `/patients` | `Patients.tsx` |
| `/notes` | `Notes.tsx` |
| `/receptionist/intake` | `ReceptionistIntake.tsx` |

Auth tokens: `ds_token` and `ds_user` in `localStorage` or `sessionStorage`. Axios client: `frontend/src/lib/api.ts` (Bearer on all routes except login/signup).

WebSocket URL: `getWebSocketUrl()` — `VITE_REACT_APP_WEBSOCKET_URL` or `window.location.origin` (nginx proxies `/socket.io`).

Key UI: `transcribeBar.tsx` (`AudioRecorder`), `ClinicalNoteViewer.tsx`, hooks `use-streaming-transcription.ts`, `use-sse-transcription.ts`, `use-clinical-note-subscription.ts`.

## Environment variables

**Backend** (see `backend/.env.example`; also root `.env` for Docker):

- `SUPABASE_DB_URL` — required for Postgres
- `SONIOX_*` — speech-to-text
- `AWS_*`, `BEDROCK_*` — note generation
- `APP_JWT_SECRET` / `JWT_SECRET`
- `FRONTEND_ORIGIN`, `PORT`

**Frontend** (build-time via Vite):

- `VITE_REACT_APP_API_BASE_URL` — often empty in Docker (paths already include `/api`)
- `VITE_REACT_APP_WEBSOCKET_URL` — often empty (same-origin via nginx)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Never commit real secrets. `.env` files are gitignored.

## Running locally

**Docker (full stack, HTTP):**

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
# App: http://localhost:8081
```

**Dev (split):**

```bash
# backend/
npm install && npm run start:dev   # :3000

# frontend/
npm install && npm run dev         # :5173 (CORS allowed in main.ts)
```

**Frontend audio smoke test:**

```bash
cd frontend && npm run test:audio-pipeline
```

## CORS / origins

Backend `main.ts` allows: `FRONTEND_ORIGIN`, `http://localhost`, `http://localhost:8081`, `http://localhost:5173`, `https://app.echoaide.in`, and production IP. Local Docker sets `FRONTEND_ORIGIN=http://localhost:8081` in `docker-compose.local.yml`.

## Conventions for agents

1. **Minimal diffs** — match existing Nest module layout and React patterns (hooks + MUI).
2. **API paths** — frontend calls use `/api/...` when `VITE_REACT_APP_API_BASE_URL` is empty.
3. **WebSocket events** — `start_recording`, `stop_recording`, audio chunk events; see `websocket.gateway.ts` and `use-streaming-transcription.ts`.
4. **Note IDs** — client generates UUID on stop; passed as `noteId` with `doctorId`, optional `patientId` / `intakeId`.
5. **No drive-by refactors** — READMEs in `backend/` and `frontend/` are stock Nest/Vite templates, not project docs.
6. **Do not commit** `.env`, credentials, or `certbot/` private keys.

## Useful files when debugging

| Area | Files |
|------|--------|
| WS + streaming | `backend/src/modules/websocket/websocket.gateway.ts`, `streaming/streaming.service.ts` |
| STT | `streaming/soniox-client.service.ts` |
| LLM notes | `streaming/incremental-note.service.ts`, `sse/schemas/parsed-note.schema.ts` |
| Recording UI | `frontend/src/components/transcribeBar.tsx`, `hooks/use-streaming-transcription.ts` |
| Nginx proxy | `frontend/nginx-local.conf`, `frontend/nginx-ssl.conf` |
| DB bootstrap | `backend/src/db/database.providers.ts` |

## Open questions / notes

- `SarvamClientService` is implemented but unused in `StreamingModule`; switching STT providers requires module wiring changes.
- User roles: `doctor` vs receptionist (`user.role` in `ds_user`); home page behavior differs by role.
- Register route is commented out in `App.tsx`; signup may be API-only or admin-driven.

---

*Last updated: 2026-05-19 — initial session context for the repo.*
