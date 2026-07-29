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
const { ProfilePage } = await server.ssrLoadModule('/src/pages/ProfilePage.tsx');
const { BrandingPage } = await server.ssrLoadModule('/src/pages/BrandingPage.tsx');
const { SponsorsPage } = await server.ssrLoadModule('/src/pages/SponsorsPage.tsx');
const { OnboardingForm } = await server.ssrLoadModule(
  '/src/pages/OnboardingPage.tsx',
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
const { MOTORSPORT_FONTS } = await server.ssrLoadModule(
  '/src/config/branding.ts',
);
const { MEDIA_FACTORY_UI_COLORS } = await server.ssrLoadModule(
  '/src/config/branding.ts',
);
const { DRIVER_FIELDS } = await server.ssrLoadModule('/src/config/profile.ts');
const { SPONSOR_LIMIT } = await server.ssrLoadModule('/src/state/pageState.ts');
const { TemplateFields } = await server.ssrLoadModule(
  '/src/components/builder/TemplateFields.tsx',
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
  let expanded = node;
  while (
    expanded &&
    typeof expanded === 'object' &&
    typeof (expanded as ElementNode).type === 'function'
  ) {
    const element = expanded as ElementNode;
    expanded = element.type!(element.props || {});
  }
  return expanded;
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

function findLabel(node: unknown, label: string): ElementNode {
  const item = findElements(node, 'label').find(
    element => textContent(element).trim().startsWith(label),
  );
  assert.ok(item, `Expected label "${label}"`);
  return item;
}

function fieldInLabel(node: unknown, label: string, type: string): ElementNode {
  const field = findElements(findLabel(node, label), type)[0];
  assert.ok(field, `Expected ${type} in label "${label}"`);
  return field;
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

test('home interface colours remain independent from selected branding colours', () => {
  const tree = HomePage({
    data: {
      ...completeData,
      branding: {
        ...completeData.branding,
        primary: '#00ff00',
        secondary: '#0000ff',
        accent: '#ffff00',
      },
    },
    openTemplate: () => {},
    openTemplates: () => {},
  }) as ElementNode;

  assert.equal(tree.props?.style, undefined);
  assert.deepEqual(MEDIA_FACTORY_UI_COLORS, {
    primary: '#ef3b3b',
    secondary: '#111317',
    accent: '#ffffff',
  });
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

test('schedule fields show only the selected days and five inline session rows per day', () => {
  const updates: Array<Partial<Project['details']>> = [];
  const baseProject: Project = {
    id: 'schedule',
    name: 'Schedule',
    template: 'schedule',
    format: 'feed',
    sponsorIds: [],
    createdAt: '',
    updatedAt: '',
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
      circuit: 'Bathurst',
      date: '',
      time: '',
      headline: '',
      subheadline: '',
      result: '',
      position: '',
      scheduleLines: '',
      sponsorName: '',
      scheduleDayCount: 1,
      scheduleDays: [
        {
          day: '',
          sessions: Array.from({ length: 5 }, () => ({
            type: '',
            time: '',
          })),
        },
      ],
    },
  };

  const oneDayTree = TemplateFields({
    project: baseProject,
    setDetails: () => {},
  });
  assert.equal(findElements(oneDayTree, 'fieldset').length, 1);
  assert.equal(findElements(oneDayTree, 'select').length, 7);
  assert.equal(
    findElements(oneDayTree, 'select').filter(select => select.props?.value === '').length,
    6,
  );
  assert.ok(findLabel(oneDayTree, 'Track name'));
  assert.ok(findLabel(oneDayTree, 'Day 1'));
  const daySelect = findElements(oneDayTree, 'select').find(
    select => select.props?.required,
  );
  assert.equal(daySelect?.props?.value, '');
  assert.equal(textContent(daySelect?.props?.children?.[0]), 'SELECT DAY');
  assert.equal(
    findElements(oneDayTree, 'input').filter(input => input.props?.type === 'time')
      .length,
    5,
  );

  const threeDayTree = TemplateFields({
    project: {
      ...baseProject,
      details: {
        ...baseProject.details,
        scheduleDayCount: 3,
        scheduleDays: (['Friday', 'Saturday', 'Sunday'] as const).map(day => ({
          day,
          sessions: Array.from({ length: 5 }, () => ({
            type: 'Race',
            time: '',
          })),
        })),
      },
    },
    setDetails: details => updates.push(details),
  });
  assert.equal(findElements(threeDayTree, 'fieldset').length, 3);
  assert.equal(
    findElements(threeDayTree, 'input').filter(input => input.props?.type === 'time')
      .length,
    15,
  );
  const removeButtons = findElements(threeDayTree, 'button').filter(
    button => textContent(button) === 'Remove day',
  );
  assert.equal(removeButtons.length, 2);
  (removeButtons[0].props?.onClick as () => void)();
  assert.equal(updates.at(-1)?.scheduleDayCount, 2);
  assert.deepEqual(
    updates.at(-1)?.scheduleDays?.map(day => day.day),
    ['Friday', 'Sunday'],
  );
});

test('sponsor appreciation exposes a sponsor-logo selector', () => {
  const updates: Array<Partial<Project['details']>> = [];
  const sponsorProject: Project = {
    id: 'sponsor-graphic',
    name: 'Sponsor Appreciation',
    template: 'sponsor',
    format: 'feed',
    sponsorIds: ['corbeau', 'edge'],
    createdAt: '',
    updatedAt: '',
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
      sponsorName: 'Corbeau',
      sponsorId: 'corbeau',
    },
  };
  const sponsorOptions = [
    { id: 'corbeau', name: 'Corbeau', logo: 'data:image/png;base64,corbeau' },
    { id: 'edge', name: 'Esports Edge', logo: 'data:image/png;base64,edge' },
  ];
  const tree = TemplateFields({
    project: sponsorProject,
    sponsors: sponsorOptions,
    setDetails: details => updates.push(details),
  });
  const selector = findElements(tree, 'select')[0];

  assert.ok(findLabel(tree, 'Sponsor logo'));
  assert.equal(selector.props?.value, 'corbeau');
  selector.props?.onChange({ target: { value: 'edge' } });
  assert.deepEqual(updates, [
    { sponsorId: 'edge', sponsorName: 'Esports Edge' },
  ]);
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

test('profile fields update the permanent driver record and retain asset previews', () => {
  const updates: Data[] = [];
  const data: Data = {
    ...completeData,
    profile: {
      ...completeData.profile,
      driverImage: 'driver.png',
      teamLogo: 'team.png',
      competitionLogo: 'competition.png',
    },
  };
  const tree = ProfilePage({
    data,
    setData: (next: Data) => updates.push(next),
  });

  assert.equal(findElements(tree, 'input').length, DRIVER_FIELDS.length + 3);
  (
    fieldInLabel(tree, 'Driver name', 'input').props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: 'Updated Driver' } });

  assert.equal(updates[0].profile.name, 'Updated Driver');
  assert.equal(updates[0].profile.driverImage, 'driver.png');
  assert.deepEqual(
    findElements(tree, 'img').map(image => image.props?.src),
    ['driver.png', 'team.png', 'competition.png'],
  );

  (findButton(tree, 'Remove team logo').props?.onClick as () => void)();
  (findButton(tree, 'Remove competition logo').props?.onClick as () => void)();

  assert.equal(updates[1].profile.teamLogo, undefined);
  assert.equal(updates[1].profile.competitionLogo, 'competition.png');
  assert.equal(updates[2].profile.teamLogo, 'team.png');
  assert.equal(updates[2].profile.competitionLogo, undefined);
});

test('branding controls expose five approved fonts and update the live preview', () => {
  const updates: Data[] = [];
  const tree = BrandingPage({
    data: completeData,
    setData: (next: Data) => updates.push(next),
  });

  const headingFont = fieldInLabel(tree, 'Heading font', 'select');
  assert.deepEqual(
    findElements(headingFont, 'option').map(option => textContent(option)),
    MOTORSPORT_FONTS,
  );
  (
    fieldInLabel(tree, 'Primary colour', 'input').props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: '#c70000' } });
  (
    headingFont.props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: MOTORSPORT_FONTS[2] } });

  assert.equal(updates[0].branding.primary, '#c70000');
  assert.equal(updates[1].branding.headingFont, MOTORSPORT_FONTS[2]);
  assert.match(textContent(tree), /#46 · T6 Msport/);
  assert.match(textContent(tree), /SPONSOR BAR · 5 PER ROW/);
});

test('sponsor interactions add, resize, rename and remove a logo slot', () => {
  const sponsor = { id: 'sponsor-one', name: 'Corbeau' };
  const data: Data = { ...completeData, sponsors: [sponsor] };
  const updates: Data[] = [];
  const tree = SponsorsPage({
    data,
    setData: (next: Data) => updates.push(next),
  });

  (findButton(tree, 'Add sponsor').props?.onClick as () => void)();
  (
    fieldInLabel(tree, 'Logo visual size', 'input').props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: '1.25' } });
  (
    fieldInLabel(tree, 'Name', 'input').props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: 'Corbeau Seats' } });
  const remove = findElements(tree, 'button').find(
    button => button.props?.className === 'icon danger',
  );
  assert.ok(remove);
  (remove.props?.onClick as () => void)();

  assert.equal(updates[0].sponsors.length, 2);
  assert.equal(updates[1].branding.sponsorLogoScale, 1.25);
  assert.equal(updates[2].sponsors[0].name, 'Corbeau Seats');
  assert.deepEqual(updates[3].sponsors, []);
});

test('sponsor page enforces the ten-logo limit in the component', () => {
  const data: Data = {
    ...completeData,
    sponsors: Array.from({ length: SPONSOR_LIMIT }, (_, index) => ({
      id: `sponsor-${index}`,
      name: `Sponsor ${index + 1}`,
    })),
  };
  const tree = SponsorsPage({ data, setData: () => {} });

  assert.equal(findButton(tree, 'Add sponsor').props?.disabled, true);
  assert.match(textContent(tree), new RegExp(`${SPONSOR_LIMIT}/${SPONSOR_LIMIT}`));
});

test('onboarding requires a driver name and number before completing the draft', () => {
  const emptyDraft: Data = {
    ...completeData,
    onboardingComplete: false,
    profile: { ...starter.profile },
  };
  const drafts: Data[] = [];
  const finished: Data[] = [];
  const initialTree = OnboardingForm({
    draft: emptyDraft,
    setDraft: (next: Data) => drafts.push(next),
    finish: (next: Data) => finished.push(next),
  });

  assert.equal(findButton(initialTree, 'Create profile').props?.disabled, true);
  (
    fieldInLabel(initialTree, 'Driver name', 'input').props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: 'Rich Weatherill' } });
  const withName = drafts[0];
  const nameTree = OnboardingForm({
    draft: withName,
    setDraft: (next: Data) => drafts.push(next),
    finish: (next: Data) => finished.push(next),
  });
  (
    fieldInLabel(nameTree, 'Car number', 'input').props?.onChange as (
      event: { target: { value: string } },
    ) => void
  )({ target: { value: '46' } });
  const completeDraft = drafts[1];
  const completeTree = OnboardingForm({
    draft: completeDraft,
    setDraft: () => {},
    finish: (next: Data) => finished.push(next),
  });

  assert.equal(findButton(completeTree, 'Create profile').props?.disabled, false);
  (findButton(completeTree, 'Create profile').props?.onClick as () => void)();
  assert.equal(finished[0].profile.name, 'Rich Weatherill');
  assert.equal(finished[0].profile.number, '46');
  assert.equal(finished[0].onboardingComplete, false);
});
