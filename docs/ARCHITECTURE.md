# Media Factory architecture

## Current application

Media Factory is a client-side React and TypeScript application built with Vite. Driver profiles, branding, sponsors and saved graphics are stored locally in the browser. Graphics are rendered as SVG and exported to PNG in the browser.

## Stability rules

The following behaviour is treated as locked unless a change is explicitly requested:

- Background images always fill the canvas while preserving aspect ratio.
- Background images can be repositioned and scaled.
- Background images are never stretched or blurred.
- Existing template styling must not change as a side effect of unrelated work.
- Driver, logo and sponsor assets retain their proportions.
- Main must contain a working, tested build.

## Branch workflow

- `main` is the stable branch.
- `develop` is the integration branch for new work.
- Feature changes should be made on a branch created from `develop`.
- Changes should reach `main` through a pull request after a successful build and visual test.

## Target source structure

The application currently concentrates most UI and rendering logic in `src/App.tsx`. It should be separated gradually, without a single large rewrite:

```text
src/
  app/
    App.tsx
    navigation.ts
  components/
    forms/
    layout/
    uploads/
  editor/
    Builder.tsx
    exportPng.ts
    imageProcessing.ts
  pages/
    BrandingPage.tsx
    HomePage.tsx
    ProfilePage.tsx
    SavedGraphicsPage.tsx
    SponsorsPage.tsx
    TemplatesPage.tsx
  templates/
    event/
    bio/
    shared/
    registry.ts
  state/
    store.ts
  types/
    index.ts
  utils/
```

## Refactor sequence

1. Extract constants, template metadata and pure image/date utilities.
2. Extract shared controls and upload components.
3. Extract pages without changing markup or CSS classes.
4. Extract the builder and PNG export logic.
5. Split each graphic template into its own renderer.
6. Add focused tests for pure calculations and rendering rules.

Each step must build successfully before the next begins. Visual changes and structural refactoring should not be mixed in the same pull request.
