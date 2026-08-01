import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('desktop builder controls scroll when their content exceeds the viewport', () => {
  const desktopBuilder = styles.match(
    /@media \(min-width: 1101px\) \{[\s\S]*?\.controls \{([\s\S]*?)\n  \}/,
  );

  assert.ok(desktopBuilder, 'desktop builder controls rule should exist');
  assert.match(desktopBuilder[1], /overflow-y:\s*auto/);
  assert.match(desktopBuilder[1], /overflow-x:\s*hidden/);
  assert.doesNotMatch(desktopBuilder[1], /overflow:\s*hidden/);
});
