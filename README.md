# Media Factory

## Cloud login

Media Factory uses Supabase Auth for email/password accounts and a protected `profiles`
table for the driver's permanent name.

1. Create a Supabase project.
2. Run the SQL files in `supabase/migrations` in filename order in the Supabase SQL editor.
3. Add `https://t6msport.github.io/media-factory/` as the Site URL and an allowed redirect URL
   under Authentication URL Configuration.
4. Copy `.env.example` to `.env.local` for local development and add the project URL and
   publishable anon key.
5. The production workflow contains the project URL and browser-safe publishable key explicitly.
   Supabase security is enforced by row-level security, not by hiding the publishable key.

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
