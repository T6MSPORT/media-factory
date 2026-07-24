# Media Factory

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
