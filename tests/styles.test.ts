import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('cards do not show decorative corner indicators', () => {
  assert.doesNotMatch(styles, /\.template-card::after/);
  assert.doesNotMatch(styles, /\.stat::after/);
  assert.doesNotMatch(styles, /\.project-card::after/);
});

test('desktop builder controls scroll when their content exceeds the viewport', () => {
  const desktopBuilder = styles.match(
    /@media \(min-width: 1101px\) \{[\s\S]*?\.controls \{([\s\S]*?)\n  \}/,
  );

  assert.ok(desktopBuilder, 'desktop builder controls rule should exist');
  assert.match(desktopBuilder[1], /overflow-y:\s*auto/);
  assert.match(desktopBuilder[1], /overflow-x:\s*hidden/);
  assert.doesNotMatch(desktopBuilder[1], /overflow:\s*hidden/);
});

test('mobile builder freezes the preview and scrolls only the controls', () => {
  assert.match(styles, /\.builder\s*\{[^}]*height:\s*100dvh[^}]*overflow:\s*hidden/);
  assert.match(styles, /\.controls\s*\{[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/);
  assert.match(styles, /\.graphic\s*\{[\s\S]*?touch-action:\s*none/);
  assert.match(styles, /\.control-section\.mobile-active\s*\{\s*display:\s*grid/);
  assert.match(styles, /\.background-slider-controls\s*\{\s*display:\s*none/);
});

test('mobile home hides the sponsors summary card', () => {
  assert.match(styles, /\.sponsors-stat\s*\{\s*display:\s*none/);
});

test('profile driver preview uses a reduced image scale on desktop and mobile', () => {
  assert.match(
    styles,
    /\.profile-previews\s*>\s*\.driver-asset-preview[\s\S]*?width:\s*min\(72%,\s*560px\)/,
  );
  assert.match(styles, /@media \(max-width:\s*700px\)[\s\S]*?width:\s*68%/);
});
