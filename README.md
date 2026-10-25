# JobHunter Frontend

Personal job aggregation dashboard built with Svelte 5, TypeScript, Vite, Tailwind CSS 4, and Lucide icons.

## Features

- Dashboard backed by real jobs and sources data
- Searchable, filterable, sortable jobs table with a detail drawer
- Full source CRUD, enable/disable controls, and manual XING synchronization
- Honest unavailable states for application tracking and unsupported metrics
- Configurable API URL, connection check, responsive navigation, and persistent theme

## Local development

The NestJS backend lives in the sibling `jobhunter` directory and listens on port `3000`.

```sh
# terminal 1: backend
cd ../jobhunter
pnpm install
pnpm start:dev

# terminal 2: frontend
cd ../jobhunter-front
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). During development, requests to `/api` are proxied to `http://localhost:3000`, so no backend CORS change is needed.

To use a different backend, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`, or change the URL from the Settings page. For a production deployment, serve both apps behind the same origin or enable CORS on the NestJS backend.

## Validation

```sh
pnpm check
pnpm build
pnpm preview
```

## Supported backend surface

- `GET /jobs`
- `GET /jobs/:id`
- `GET /sources`
- `GET /sources/:id`
- `POST /sources`
- `PATCH /sources/:id`
- `DELETE /sources/:id`
- `POST /sources/:id/sync`

The current backend does not expose application persistence, read/unread job state, or an Indeed sync adapter. The UI communicates those limitations instead of creating local mock data.
