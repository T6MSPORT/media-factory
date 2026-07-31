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
const {
  deleteLegacyData,
  loadAccountData,
  loadDurableData,
  saveAccountData,
  saveDurableData,
} = await server.ssrLoadModule(
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

test('each cloud account has a separate durable workspace', async () => {
  const factory = new IDBFactory();
  const first = {
    ...starter,
    profile: { ...starter.profile, name: 'Driver One', number: '1' },
  };
  const second = {
    ...starter,
    profile: { ...starter.profile, name: 'Driver Two', number: '2' },
  };

  await saveAccountData('account-one', first, factory);
  await saveAccountData('account-two', second, factory);

  assert.equal((await loadAccountData('account-one', factory))?.profile.number, '1');
  assert.equal((await loadAccountData('account-two', factory))?.profile.number, '2');
  assert.equal(await loadAccountData('account-three', factory), undefined);
});

test('claiming legacy work can remove only the unowned legacy record', async () => {
  const factory = new IDBFactory();
  const legacy = { ...starter, onboardingComplete: true };
  const owned = { ...starter, projects: [{ id: 'owned-project' }] };

  await saveDurableData(legacy, factory);
  await saveAccountData('account-one', owned, factory);
  await deleteLegacyData(factory);

  assert.equal(await loadDurableData(factory), undefined);
  assert.equal((await loadAccountData('account-one', factory))?.projects[0].id, 'owned-project');
});
