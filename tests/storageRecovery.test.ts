import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

type ElementNode = {
  type?: string;
  props?: Record<string, unknown> & { children?: unknown };
};

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { StorageRecovery } = await server.ssrLoadModule(
  '/src/components/StorageRecovery.tsx',
);

after(() => server.close());

function textContent(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join(' ');
  if (!node || typeof node !== 'object') return '';
  return textContent((node as ElementNode).props?.children);
}

function findButton(node: unknown): ElementNode | undefined {
  if (Array.isArray(node)) {
    return node.map(findButton).find(Boolean);
  }
  if (!node || typeof node !== 'object') return undefined;
  const element = node as ElementNode;
  if (element.type === 'button') return element;
  return findButton(element.props?.children);
}

test('storage recovery stays hidden when persistence is healthy', () => {
  assert.equal(StorageRecovery({ issue: undefined, retry: () => {} }), null);
});

test('load recovery warns that existing browser data was not overwritten', () => {
  let retries = 0;
  const tree = StorageRecovery({
    issue: { operation: 'load', error: new SyntaxError('broken') },
    retry: () => {
      retries += 1;
    },
  });

  assert.match(textContent(tree), /Saved data could not be loaded/);
  assert.match(textContent(tree), /has not been overwritten/);
  (findButton(tree)?.props?.onClick as () => void)();
  assert.equal(retries, 1);
});

test('save recovery confirms open work remains available', () => {
  const tree = StorageRecovery({
    issue: { operation: 'save', error: new Error('quota exceeded') },
    retry: () => {},
  });

  assert.match(textContent(tree), /Changes are not being saved/);
  assert.match(textContent(tree), /latest changes are still open/);
});
