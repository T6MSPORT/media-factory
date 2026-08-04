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
const { formatEventDateRange } = await server.ssrLoadModule('/src/utils/format.ts');

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
