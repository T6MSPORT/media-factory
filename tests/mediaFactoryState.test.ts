import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Data, Project } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const {
  addProject,
  completeOnboarding,
  createProject,
  updateProject,
} = await server.ssrLoadModule('/src/state/mediaFactoryState.ts');
const {
  MOTORSPORT_FONTS,
  STORAGE_KEY,
  load,
  normaliseData,
  save,
  starter,
} = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

const data: Data = {
  ...starter,
  sponsors: Array.from({ length: 12 }, (_, index) => ({
    id: `sponsor-${index + 1}`,
    name: `Sponsor ${index + 1}`,
  })),
  projects: [],
};

test('new projects retain defaults, timestamps and the first ten sponsors', () => {
  const project = createProject('event', data, {
    createId: (prefix: string) => `${prefix}-123`,
    now: () => '2026-07-25T12:00:00.000Z',
  });

  assert.deepEqual(project, {
    id: 'graphic-123',
    name: 'Event Poster',
    template: 'event',
    format: 'feed',
    sponsorIds: data.sponsors.slice(0, 10).map(sponsor => sponsor.id),
    createdAt: '2026-07-25T12:00:00.000Z',
    updatedAt: '2026-07-25T12:00:00.000Z',
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
  });
});

test('project creation prepends without changing existing projects', () => {
  const existing = { id: 'existing' } as Project;
  const created = { id: 'created' } as Project;
  const next = addProject({ ...data, projects: [existing] }, created);

  assert.deepEqual(next.projects, [created, existing]);
});

test('project updates target only the open project and refresh its timestamp', () => {
  const first = { id: 'first', name: 'First', updatedAt: 'old' } as Project;
  const second = { id: 'second', name: 'Second', updatedAt: 'old' } as Project;
  const next = updateProject(
    { ...data, projects: [first, second] },
    'second',
    { name: 'Updated' },
    () => '2026-07-25T12:30:00.000Z',
  );

  assert.equal(next.projects[0], first);
  assert.deepEqual(next.projects[1], {
    ...second,
    name: 'Updated',
    updatedAt: '2026-07-25T12:30:00.000Z',
  });
});

test('finishing onboarding preserves the draft and marks it complete', () => {
  const draft = { ...data, onboardingComplete: false };
  assert.deepEqual(completeOnboarding(draft), {
    ...draft,
    onboardingComplete: true,
  });
});

test('autosave writes the complete state under the existing storage key', () => {
  const writes: Array<[string, string]> = [];
  save(data, {
    setItem: (key: string, value: string) => writes.push([key, value]),
  });

  assert.deepEqual(writes, [[STORAGE_KEY, JSON.stringify(data)]]);
});

test('autosave reports storage failures without changing state', () => {
  const failure = new Error('quota exceeded');
  const errors: unknown[] = [];
  save(
    data,
    {
      setItem: () => {
        throw failure;
      },
    },
    error => errors.push(error),
  );

  assert.deepEqual(errors, [failure]);
  assert.deepEqual(data.projects, []);
});

test('load retains storage migrations and rejects invalid persisted values', () => {
  const loaded = load({
    getItem: () =>
      JSON.stringify({
        onboardingComplete: true,
        profile: { name: 'Rich', heroImage: 'legacy', carImage: 'legacy' },
        branding: {
          sponsorLogoScale: 5,
          headingFont: 'Times New Roman',
          bodyFont: MOTORSPORT_FONTS[2],
        },
        projects: [
          {
            id: 'graphic',
            heroImage: 'hero',
            heroScale: 0.5,
            driverVisible: false,
            exportedAt: 123,
          },
        ],
      }),
  });

  assert.equal(loaded.onboardingComplete, true);
  assert.equal(loaded.profile.name, 'Rich');
  assert.equal('heroImage' in loaded.profile, false);
  assert.equal('carImage' in loaded.profile, false);
  assert.equal(loaded.branding.sponsorLogoScale, 1.4);
  assert.equal(loaded.branding.headingFont, starter.branding.headingFont);
  assert.equal(loaded.branding.bodyFont, MOTORSPORT_FONTS[2]);
  assert.equal(loaded.projects[0].heroScale, 1);
  assert.equal(loaded.projects[0].driverVisible, false);
  assert.equal(loaded.projects[0].exportedAt, undefined);
});

test('normalisation and corrupt storage fall back to the starter state', () => {
  assert.deepEqual(normaliseData(null), starter);
  assert.equal(
    load({
      getItem: () => '{broken',
    }),
    starter,
  );
});
