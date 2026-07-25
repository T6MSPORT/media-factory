import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Sponsor } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { uploadImage } = await server.ssrLoadModule(
  '/src/components/forms/ImageUpload.tsx',
);
const { saveSponsorLogo } = await server.ssrLoadModule(
  '/src/pages/SponsorsPage.tsx',
);

after(() => server.close());

const file = { name: 'driver.png', type: 'image/png' } as File;

test('successful uploads process the correct purpose before updating state', async () => {
  const calls: string[] = [];

  await uploadImage(
    file,
    'portrait',
    async (image: string) => {
      await Promise.resolve();
      calls.push(`saved:${image}`);
    },
    async (selected: File, purpose: string) => {
      calls.push(`processed:${selected.name}:${purpose}`);
      return 'data:image/webp;base64,driver';
    },
  );

  assert.deepEqual(calls, [
    'processed:driver.png:portrait',
    'saved:data:image/webp;base64,driver',
  ]);
});

test('processing failures never update the selected asset', async () => {
  const updates: string[] = [];
  const failure = new Error('The image could not be read.');

  await assert.rejects(
    uploadImage(
      file,
      'logo',
      (image: string) => updates.push(image),
      async () => {
        throw failure;
      },
    ),
    failure,
  );

  assert.deepEqual(updates, []);
});

test('async asset-update failures are awaited and reported to the upload control', async () => {
  const failure = new Error('The image dimensions could not be read.');

  await assert.rejects(
    uploadImage(
      file,
      'background',
      async () => {
        await Promise.resolve();
        throw failure;
      },
      async () => 'data:image/webp;base64,background',
    ),
    failure,
  );
});

test('sponsor logos update only after visible dimensions are available', async () => {
  const patches: Partial<Sponsor>[] = [];

  await saveSponsorLogo(
    'data:image/webp;base64,logo',
    (patch: Partial<Sponsor>) => patches.push(patch),
    async () => ({ width: 640, height: 240 }),
  );

  assert.deepEqual(patches, [
    {
      logo: 'data:image/webp;base64,logo',
      logoWidth: 640,
      logoHeight: 240,
    },
  ]);
});

test('failed sponsor dimension checks preserve the existing logo and dimensions', async () => {
  const patches: Partial<Sponsor>[] = [];

  await assert.rejects(
    saveSponsorLogo(
      'data:image/webp;base64,replacement',
      (patch: Partial<Sponsor>) => patches.push(patch),
      async () => {
        throw new Error('The image could not be opened.');
      },
    ),
    /could not be opened/,
  );

  assert.deepEqual(patches, []);
});
