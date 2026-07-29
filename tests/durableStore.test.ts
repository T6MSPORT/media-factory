import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { IDBFactory } from 'fake-indexeddb';
import type { Data } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { createServer } = await import('vite');
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { loadDurableData, saveDurableData } = await server.ssrLoadModule(
  '/src/durableStore.ts',
);
const { starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

test('durable browser storage retains full image-heavy state', async () => {
  const factory = new IDBFactory();
  const image = `data:image/webp;base64,${'a'.repeat(6_000_000)}`;
  const data: Data = {
    ...starter,
    onboardingComplete: true,
    profile: {
      name: 'Rich Weatherill',
      number: '46',
      team: 'T6 Msport',
      nameLocked: false,
      driverImage: image,
      teamLogo: image,
      competitionLogo: image,
    },
  };

  await saveDurableData(data, factory);
  const loaded = await loadDurableData(factory);

  assert.deepEqual(loaded, data);
});

test('durable browser storage reports an empty database before migration', async () => {
  const factory = new IDBFactory();
  assert.equal(await loadDurableData(factory), undefined);
});
