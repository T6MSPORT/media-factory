import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { formatEventDateRange, formatSavedGraphicDate, getCanvasDimensions } =
  await server.ssrLoadModule('/src/utils/format.ts');

after(() => server.close());

test('event dates support a single day and compact same-month ranges', () => {
  assert.equal(formatEventDateRange('2026-09-06'), '6 SEPTEMBER');
  assert.equal(
    formatEventDateRange('2026-09-06', '2026-09-08'),
    '6-8 SEPTEMBER',
  );
});

test('event date ranges retain both month names when they cross a month', () => {
  assert.equal(
    formatEventDateRange('2026-08-30', '2026-09-01'),
    '30 AUGUST-1 SEPTEMBER',
  );
});

test('invalid or reversed range ends fall back to the start date', () => {
  assert.equal(
    formatEventDateRange('2026-09-06', '2026-09-05'),
    '6 SEPTEMBER',
  );
});

test('saved graphic dates always use UK day month year order', () => {
  assert.equal(formatSavedGraphicDate('2026-08-05T23:30:00.000Z'), '05/08/26');
});

test('square and custom canvases preserve the requested aspect ratio', () => {
  assert.deepEqual(getCanvasDimensions('square'), { width: 1080, height: 1080 });
  assert.deepEqual(
    getCanvasDimensions({ format: 'custom', customWidth: 1600, customHeight: 900 }),
    { width: 1920, height: 1080 },
  );
  assert.deepEqual(
    getCanvasDimensions({ format: 'custom', customWidth: 900, customHeight: 1600 }),
    { width: 1080, height: 1920 },
  );
});
