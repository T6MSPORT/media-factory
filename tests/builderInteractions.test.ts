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
  getBackgroundPinchScale,
  getUploadedHeroPatch,
  removeBackgroundHeroPatch,
  resetBackgroundPatch,
  resetDriverPatch,
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

test('background pinch zoom scales proportionally within safe limits', () => {
  assert.ok(Math.abs(getBackgroundPinchScale(1.2, 100, 150) - 1.8) < 0.0001);
  assert.equal(getBackgroundPinchScale(2, 100, 200), 2.5);
  assert.equal(getBackgroundPinchScale(1.2, 100, 20), 1);
  assert.equal(getBackgroundPinchScale(1.4, 0, 100), 1.4);
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
    async (...args: unknown[]) => {
      calls.push(args);
      return { blob: new Blob(), fileName: 'custom.png' };
    },
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

test('PNG export returns the downloaded file for cloud archiving', async () => {
  const exported = await exportProjectPng(
    {} as SVGSVGElement,
    project,
    async () => ({ blob: new Blob(['png']), fileName: 'bathurst.png' }),
  );

  assert.equal(exported?.fileName, 'bathurst.png');
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

    assert.equal(exported, null);
  } finally {
    console.error = originalError;
  }
});

