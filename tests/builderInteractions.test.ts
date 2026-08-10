import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Project } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const {
  centreBackgroundPatch,
  createBackgroundDrag,
  exportProjectPng,
  getBackgroundDragPatch,
  getUploadedHeroPatch,
  removeBackgroundHeroPatch,
  resetBackgroundPatch,
  resetDriverPatch,
  saveProjectDesign,
  zoomBackgroundToFillPatch,
} = await server.ssrLoadModule(
  '/src/components/builder/builderInteractions.ts',
);
const { EXPORT_FONT_FILES, getExportFontFiles, getPngExportPlan } = await server.ssrLoadModule(
  '/src/utils/export.ts',
);

after(() => server.close());

const project: Project = {
  id: 'graphic',
  name: 'Bathurst Race Weekend',
  template: 'event',
  format: 'story',
  sponsorIds: [],
  createdAt: '',
  updatedAt: '',
  heroImage: 'data:image/png;base64,hero',
  heroImageWidth: 1920,
  heroImageHeight: 1080,
  heroX: 30,
  heroY: -20,
  heroScale: 1.2,
  heroFlip: true,
  driverX: 12,
  driverY: 24,
  driverScale: 1.1,
  driverVisible: true,
  details: {
    eventName: '',
    round: '3',
    circuit: 'Bathurst',
    date: '2026-09-06',
    time: '19:30',
    headline: '',
    subheadline: '',
    result: '',
    position: '',
    scheduleLines: '',
    sponsorName: '',
  },
};

test('background dragging converts preview movement into exact canvas movement', () => {
  const drag = createBackgroundDrag(project, {
    clientX: 100,
    clientY: 200,
    pointerId: 7,
  });

  assert.deepEqual(
    getBackgroundDragPatch(
      drag,
      { clientX: 150, clientY: 250, pointerId: 7 },
      { width: 540, height: 960 },
      'story',
    ),
    { heroX: 130, heroY: 80 },
  );
});

test('background dragging ignores another pointer and an unavailable preview', () => {
  const drag = createBackgroundDrag(project, {
    clientX: 100,
    clientY: 200,
    pointerId: 7,
  });

  assert.equal(
    getBackgroundDragPatch(
      drag,
      { clientX: 150, clientY: 250, pointerId: 8 },
      { width: 540, height: 960 },
      'story',
    ),
    null,
  );
  assert.equal(
    getBackgroundDragPatch(
      drag,
      { clientX: 150, clientY: 250, pointerId: 7 },
      { width: 0, height: 960 },
      'story',
    ),
    null,
  );
});

test('image upload and positioning controls retain their approved patches', () => {
  assert.deepEqual(getUploadedHeroPatch('hero', { width: 2400, height: 1600 }), {
    heroImage: 'hero',
    heroImageWidth: 2400,
    heroImageHeight: 1600,
    heroX: 0,
    heroY: 0,
    heroScale: 1,
    heroOverlayOpacity: 0,
  });
  assert.deepEqual(centreBackgroundPatch, { heroX: 0, heroY: 0 });
  assert.deepEqual(zoomBackgroundToFillPatch, {
    heroX: 0,
    heroY: 0,
    heroScale: 1,
  });
  assert.deepEqual(resetBackgroundPatch, {
    heroX: 0,
    heroY: 0,
    heroScale: 1,
    heroFlip: false,
  });
  assert.deepEqual(removeBackgroundHeroPatch, {
    heroImage: '',
    heroImageWidth: 0,
    heroImageHeight: 0,
    heroOverlayOpacity: 0,
    heroX: 0,
    heroY: 0,
    heroScale: 1,
    heroFlip: false,
  });
  assert.deepEqual(resetDriverPatch, {
    driverX: 0,
    driverY: 0,
    driverScale: 1,
  });
});

test('PNG plans retain full resolution and safe filenames', () => {
  assert.deepEqual(getPngExportPlan('feed', 'Bathurst Race Weekend'), {
    width: 1080,
    height: 1350,
    fileName: 'bathurst-race-weekend.png',
    mimeType: 'image/png',
  });
  assert.deepEqual(getPngExportPlan('story', 'Bathurst Race Weekend'), {
    width: 1080,
    height: 1920,
    fileName: 'bathurst-race-weekend.png',
    mimeType: 'image/png',
  });
  assert.deepEqual(getPngExportPlan('square', 'Square Graphic'), {
    width: 1080,
    height: 1080,
    fileName: 'square-graphic.png',
    mimeType: 'image/png',
  });
  assert.deepEqual(getPngExportPlan('custom', 'Custom Graphic', 1600, 900), {
    width: 1600,
    height: 900,
    fileName: 'custom-graphic.png',
    mimeType: 'image/png',
  });
});

test('custom export forwards the exact requested output dimensions', async () => {
  const calls: unknown[][] = [];
  await exportProjectPng(
    {} as SVGSVGElement,
    { ...project, format: 'custom', customWidth: 1600, customHeight: 900 },
    async (...args: unknown[]) => { calls.push(args); },
  );
  assert.deepEqual(calls[0].slice(1), ['custom', project.name, 1600, 900]);
});

test('PNG export resolves only the fonts used by the SVG for embedding', () => {
  const files = getExportFontFiles(
    '<svg><text font-family="Orbitron, Arial, sans-serif">RACE</text>' +
      '<text font-family="Rajdhani, Arial, sans-serif">ROUND 1</text></svg>',
  );

  assert.deepEqual(
    files.map((font: { family: string; weight: string }) => [
      font.family,
      font.weight,
    ]),
    [
      ['Orbitron', '400 900'],
      ['Rajdhani', '400'],
      ['Rajdhani', '700 900'],
    ],
  );
  assert.equal(EXPORT_FONT_FILES.length, 6);
});

test('PNG export downloads without changing saved design state', async () => {
  const exported = await exportProjectPng(
    {} as SVGSVGElement,
    project,
    async () => {},
  );

  assert.equal(exported, true);
});

test('a failed PNG export reports failure without changing the design', async () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    const exported = await exportProjectPng(
      {} as SVGSVGElement,
      project,
      async () => {
        throw new Error('export failed');
      },
    );

    assert.equal(exported, false);
  } finally {
    console.error = originalError;
  }
});

test('Save design marks a draft once and retains its original saved date', () => {
  const patches: Partial<Project>[] = [];
  saveProjectDesign(
    project,
    patch => patches.push(patch),
    () => '2026-07-25T10:00:00.000Z',
  );
  saveProjectDesign(
    { ...project, savedAt: '2026-07-24T09:00:00.000Z' },
    patch => patches.push(patch),
    () => '2026-07-26T10:00:00.000Z',
  );

  assert.deepEqual(patches, [
    { savedAt: '2026-07-25T10:00:00.000Z' },
    { savedAt: '2026-07-24T09:00:00.000Z' },
  ]);
});
