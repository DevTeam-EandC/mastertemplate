# Elevate Sales Dashboard — React + Tailwind CSS

A responsive, minimalist sales dashboard frontend using the supplied palette:
- `#134074` — primary blue
- `#13315C` — navy
- `#0B2545` — deep ink
- `#8DA9C4` — steel blue
- `#EEF4ED` — mist

## Requirements
- Node.js 18+
- npm

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```
The static site is generated in `dist/`. Copy the contents of `dist/` to your ASP.NET Core app's static web root (commonly `wwwroot`) or configure ASP.NET Core to serve the built files.

## Demo behavior
- Login accepts any non-empty email and password. It is a UI-only demo, not authentication.
- New client flow has four steps and supports up to 20 elevator specification sections.
- Records are saved to browser `localStorage` so the prototype works without a database.
- Demo login session is stored in `sessionStorage`.

## ASP.NET Core integration notes
This project intentionally contains no database, server, or API calls. For integration:
1. Replace the demo `login()` handler with your ASP.NET Core authentication endpoint (cookie auth or JWT).
2. Replace `saveClient()` localStorage persistence with `POST /api/clients`.
3. Load the client directory from `GET /api/clients`.
4. Keep API calls in a small service module (for example `src/services/clientService.js`) and use environment configuration for the API base URL.
5. Enforce authorization and validate all fields server-side. Do not rely on frontend-only required checks.

The `projectType` field is read-only and defaults to `Private`; Account Manager follows the selected Sales Officer. New unit without inspection is the default unit type.

## Elevator RFQ form features (integrated from the supplied HTML)
- Four-step intake flow: client, project, total elevator quantity, elevator groups.
- RFQ / project number preview with yearly local sequence (`P-NE-CODE-YYYY-001`).
- Project short-code generation from project/building name or client name.
- Elevator group cards with add, duplicate, remove, completeness indicators, and quantity allocation.
- Automatic car-code prefixes by elevator type (PE, FE, GE, HE, RE, DW), with sequential numbers per type.
- Elevator capacity, floor/stop/opening, machine-room, door, control, shaft, through-door, and department-notification fields.
- Save/restore draft in browser storage and export the submitted RFQ as JSON.
