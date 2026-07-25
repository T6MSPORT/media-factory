import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Data, Project } from '../src/types.ts';

type ElementNode = {
  type?: string | ((props: Record<string, unknown>) => unknown);
  props?: Record<string, unknown> & { children?: unknown };
};

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});

const { Sidebar } = await server.ssrLoadModule(
  '/src/components/navigation/Sidebar.tsx',
);
const { HomePage } = await server.ssrLoadModule('/src/pages/HomePage.tsx');
const { SavedGraphicsPage } = await server.ssrLoadModule(
  '/src/pages/SavedGraphicsPage.tsx',
);
const { TemplateLibraryPage } = await server.ssrLoadModule(
  '/src/pages/TemplateLibraryPage.tsx',
);
const { NAVIGATION_ITEMS } = await server.ssrLoadModule(
  '/src/config/navigation.ts',
);
const { TEMPLATE_CATALOGUE } = await server.ssrLoadModule(
  '/src/config/templates.ts',
);
const { starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

const completeData: Data = {
  ...starter,
  onboardingComplete: true,
  profile: {
    ...starter.profile,
    name: 'Rich Weatherill',
    number: '46',
    team: 'T6 Msport',
  },
  branding: { ...starter.branding },
  sponsors: [],
  projects: [],
};

function expand(node: unknown): unknown {
  if (
    node &&
    typeof node === 'object' &&
    typeof (node as ElementNode).type === 'function'
  ) {
    const element = node as ElementNode;
    return element.type!(element.props || {});
  }
  return node;
}

function findElements(node: unknown, type: string, found: ElementNode[] = []): ElementNode[] {
  if (Array.isArray(node)) {
    node.forEach(child => findElements(child, type, found));
    return found;
  }

  const expanded = expand(node);
  if (!expanded || typeof expanded !== 'object') return found;

  const element = expanded as ElementNode;
  if (element.type === type) found.push(element);
  findElements(element.props?.children, type, found);
  return found;
}

function textContent(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');

  const expanded = expand(node);
  if (!expanded || typeof expanded !== 'object') return '';
  return textContent((expanded as ElementNode).props?.children);
}

function findButton(node: unknown, label: string): ElementNode {
  const button = findElements(node, 'button').find(
    item => textContent(item).trim() === label,
  );
  assert.ok(button, `Expected button "${label}"`);
  return button;
}

function findButtonContaining(node: unknown, label: string): ElementNode {
  const button = findElements(node, 'button').find(
    item => textContent(item).includes(label),
  );
  assert.ok(button, `Expected button containing "${label}"`);
  return button;
}

test('sidebar exposes every approved destination and reports navigation', () => {
  const navigated: string[] = [];
  const tree = Sidebar({
    activePage: 'branding',
    onNavigate: (page: string) => navigated.push(page),
  });
  const buttons = findElements(tree, 'button');

  assert.deepEqual(
    buttons.map(button => textContent(button).trim()),
    NAVIGATION_ITEMS.map((item: { label: string }) => item.label),
  );
  assert.equal(
    findButton(tree, 'Branding').props?.className,
    'active',
  );

  (findButton(tree, 'Saved Graphics').props?.onClick as () => void)();
  assert.deepEqual(navigated, ['saved']);
});

test('home actions open the template library and the selected popular template', () => {
  const opened: string[] = [];
  let browsed = 0;
  const tree = HomePage({
    data: completeData,
    openTemplate: (template: string) => opened.push(template),
    openTemplates: () => {
      browsed += 1;
    },
  });

  (findButton(tree, 'Browse templates').props?.onClick as () => void)();
  (
    findButtonContaining(tree, TEMPLATE_CATALOGUE[0].name).props?.onClick as () => void
  )();

  assert.equal(browsed, 1);
  assert.deepEqual(opened, [TEMPLATE_CATALOGUE[0].id]);
});

test('template library exposes all templates and opens the chosen generator', () => {
  const opened: string[] = [];
  const tree = TemplateLibraryPage({
    openTemplate: (template: string) => opened.push(template),
  });
  const buttons = findElements(tree, 'button');

  assert.equal(buttons.length, TEMPLATE_CATALOGUE.length);
  (
    buttons.at(-1)!.props?.onClick as () => void
  )();
  assert.deepEqual(opened, [TEMPLATE_CATALOGUE.at(-1).id]);
});

test('saved graphics empty state remains visible without successful exports', () => {
  const tree = SavedGraphicsPage({
    data: completeData,
    setData: () => {},
    open: () => {},
  });

  assert.match(textContent(tree), /No saved graphics yet/);
  assert.match(textContent(tree), /saved here when its PNG is exported/);
});

test('saved graphic cards rename, reopen and confirm before deletion', () => {
  const savedProject: Project = {
    id: 'saved-one',
    name: 'Bathurst Race Day',
    template: 'event',
    format: 'feed',
    sponsorIds: [],
    createdAt: '2026-07-24T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
    exportedAt: '2026-07-25T10:00:00.000Z',
    heroImage: '',
    heroImageWidth: 0,
    heroImageHeight: 0,
    heroX: 0,
    heroY: 0,
    heroScale: 1,
    heroFlip: false,
    driverX: 0,
    driverY: 0,
    driverScale: 1,
    driverVisible: true,
    details: {
      eventName: '',
      round: '',
      circuit: '',
      date: '',
      time: '',
      headline: '',
      subheadline: '',
      result: '',
      position: '',
      scheduleLines: '',
      sponsorName: '',
    },
  };
  const data = { ...completeData, projects: [savedProject] };
  const updates: Data[] = [];
  const opened: Project[] = [];
  const prompts: string[] = [];
  Object.assign(globalThis, {
    window: {
      confirm: (message: string) => {
        prompts.push(message);
        return true;
      },
    },
  });
  const tree = SavedGraphicsPage({
    data,
    setData: (next: Data) => updates.push(next),
    open: (project: Project) => opened.push(project),
  });

  const nameInput = findElements(tree, 'input')[0];
  (
    nameInput.props?.onChange as (event: { target: { value: string } }) => void
  )({ target: { value: 'Bathurst Final' } });
  (findButton(tree, 'Open').props?.onClick as () => void)();
  const deleteButton = findElements(tree, 'button').find(
    button => button.props?.['aria-label'] === 'Delete Bathurst Race Day',
  );
  assert.ok(deleteButton);
  (deleteButton.props?.onClick as () => void)();

  assert.equal(updates[0].projects[0].name, 'Bathurst Final');
  assert.deepEqual(opened, [savedProject]);
  assert.deepEqual(prompts, ['Delete "Bathurst Race Day" from Saved Graphics?']);
  assert.deepEqual(updates[1].projects, []);
});
