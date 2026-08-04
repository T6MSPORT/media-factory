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
const {
  backgroundRemovalFileName,
  removeImageBackground,
} = await server.ssrLoadModule('/src/utils/backgroundRemoval.ts');

after(() => server.close());

test('background removal uses the lightweight transparent PNG configuration', async () => {
  const progress: number[] = [];
  let receivedFile: File | undefined;
  let receivedConfig: Record<string, unknown> | undefined;
  const output = new Blob(['transparent'], { type: 'image/png' });
  const file = new File(['image'], 'driver.jpg', { type: 'image/jpeg' });

  const result = await removeImageBackground(
    file,
    (percentage: number) => progress.push(percentage),
    async () => async (image: File, config: Record<string, unknown>) => {
      receivedFile = image;
      receivedConfig = config;
      (config.progress as Function)('model', 20, 40);
      return output;
    },
  );

  assert.equal(result, output);
  assert.equal(receivedFile, file);
  assert.equal(receivedConfig?.model, 'isnet_quint8');
  assert.deepEqual(receivedConfig?.output, { format: 'image/png', quality: 1 });
  assert.deepEqual(progress, [50]);
});

test('background removal rejects non-image uploads before loading the model', async () => {
  let engineLoaded = false;
  const file = new File(['notes'], 'notes.txt', { type: 'text/plain' });

  await assert.rejects(
    removeImageBackground(file, undefined, async () => {
      engineLoaded = true;
      return async () => new Blob();
    }),
    /JPEG, PNG or WebP/,
  );
  assert.equal(engineLoaded, false);
});

test('transparent downloads keep a recognisable file name', () => {
  assert.equal(backgroundRemovalFileName('Driver Portrait.JPG'), 'Driver Portrait-no-background.png');
  assert.equal(backgroundRemovalFileName('image'), 'image-no-background.png');
});
