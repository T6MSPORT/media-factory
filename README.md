# Media Factory

## Cloud login

Media Factory uses Supabase Auth for email/password accounts and a protected `profiles`
table for the driver's permanent name.

1. Create a Supabase project.
2. Run `supabase/migrations/202607300001_cloud_auth.sql` in the Supabase SQL editor.
3. Add `https://t6msport.github.io/media-factory/` as the Site URL and an allowed redirect URL
   under Authentication URL Configuration.
4. Copy `.env.example` to `.env.local` for local development and add the project URL and
   publishable anon key.
5. Add the same values to the GitHub repository as Actions secrets named
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Passwords and sessions are handled by Supabase. The browser stores only the cloud account
identity and the user's Media Factory work. The database trigger prevents a driver name from
being changed after registration.

Media Factory is a browser-based motorsport graphics application for racing drivers. It stores driver details, branding and sponsor assets locally, renders graphics as SVG and exports finished artwork as PNG.

## Requirements

- Node.js 22
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local address shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Branches

- `main` — stable, tested builds
- `develop` — integration branch for current development

Create feature branches from `develop`. Merge into `main` only after the automated build passes and the affected templates have been visually checked.

## Repository rules

Generated files such as `node_modules`, `dist` and TypeScript build information are not committed. Do not commit personal `.env` files or uploaded driver and sponsor assets.

The planned code structure and safe refactoring sequence are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
