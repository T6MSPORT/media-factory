import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Data, Project, Sponsor } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const {
  SPONSOR_LIMIT,
  addSponsor,
  getSavedProjects,
  moveSponsor,
  removeSponsor,
  removeSavedProject,
  renameSavedProject,
  updateBranding,
  updateProfile,
  updateSponsor,
} = await server.ssrLoadModule('/src/state/pageState.ts');
const { starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

const firstSponsor: Sponsor = {
  id: 'sponsor-one',
  name: 'Sponsor One',
  logo: 'one.png',
  logoWidth: 400,
  logoHeight: 200,
};
const secondSponsor: Sponsor = {
  id: 'sponsor-two',
  name: 'Sponsor Two',
};
const project = {
  id: 'graphic-one',
  sponsorIds: [firstSponsor.id, secondSponsor.id],
} as Project;
const data: Data = {
  ...starter,
  profile: { ...starter.profile, name: 'Rich', number: '46' },
  branding: { ...starter.branding },
  sponsors: [firstSponsor, secondSponsor],
  projects: [project],
};

test('profile updates preserve all unrelated state', () => {
  const next = updateProfile(data, {
    team: 'T6 Msport',
    driverImage: 'driver.png',
  });

  assert.deepEqual(next.profile, {
    ...data.profile,
    team: 'T6 Msport',
    driverImage: 'driver.png',
  });
  assert.equal(next.branding, data.branding);
  assert.equal(next.sponsors, data.sponsors);
  assert.equal(next.projects, data.projects);
});

test('a locked driver name cannot be changed through profile updates', () => {
  const locked: Data = {
    ...data,
    profile: { ...data.profile, nameLocked: true },
  };
  const next = updateProfile(locked, {
    name: 'Different Driver',
    number: '99',
  });

  assert.equal(next.profile.name, 'Rich');
  assert.equal(next.profile.number, '99');
});

test('branding updates preserve the profile, sponsors and projects', () => {
  const next = updateBranding(data, {
    primary: '#c70000',
    headingFont: 'Teko',
  });

  assert.deepEqual(next.branding, {
    ...data.branding,
    primary: '#c70000',
    headingFont: 'Teko',
  });
  assert.equal(next.profile, data.profile);
  assert.equal(next.sponsors, data.sponsors);
  assert.equal(next.projects, data.projects);
});

test('sponsor scale uses the same branding update path', () => {
  const next = updateBranding(data, { sponsorLogoScale: 1.25 });

  assert.equal(next.branding.sponsorLogoScale, 1.25);
  assert.equal(next.sponsors, data.sponsors);
});

test('adding a sponsor appends the existing default record', () => {
  const next = addSponsor(data, prefix => `${prefix}-new`);

  assert.deepEqual(next.sponsors, [
    firstSponsor,
    secondSponsor,
    { id: 'sponsor-new', name: 'New Sponsor' },
  ]);
  assert.equal(next.projects, data.projects);
});

test('the sponsor limit prevents an eleventh record', () => {
  const full = {
    ...data,
    sponsors: Array.from({ length: SPONSOR_LIMIT }, (_, index) => ({
      id: `sponsor-${index}`,
      name: `Sponsor ${index}`,
    })),
  };

  assert.equal(addSponsor(full, () => 'unused'), full);
});

test('sponsor updates target one record and retain measured logo dimensions', () => {
  const next = updateSponsor(data, secondSponsor.id, {
    name: 'Updated Sponsor',
    logo: 'updated.png',
    logoWidth: 320,
    logoHeight: 180,
  });

  assert.equal(next.sponsors[0], firstSponsor);
  assert.deepEqual(next.sponsors[1], {
    ...secondSponsor,
    name: 'Updated Sponsor',
    logo: 'updated.png',
    logoWidth: 320,
    logoHeight: 180,
  });
});

test('sponsors can be reordered while preserving their records', () => {
  const movedUp = moveSponsor(data, secondSponsor.id, -1);
  assert.deepEqual(movedUp.sponsors, [secondSponsor, firstSponsor]);

  const movedDown = moveSponsor(data, firstSponsor.id, 1);
  assert.deepEqual(movedDown.sponsors, [secondSponsor, firstSponsor]);
  assert.equal(moveSponsor(data, firstSponsor.id, -1), data);
  assert.equal(moveSponsor(data, secondSponsor.id, 1), data);
});

test('failed logo measurement still clears the stored dimensions', () => {
  const next = updateSponsor(data, firstSponsor.id, {
    logo: 'replacement.png',
    logoWidth: undefined,
    logoHeight: undefined,
  });

  assert.deepEqual(next.sponsors[0], {
    ...firstSponsor,
    logo: 'replacement.png',
    logoWidth: undefined,
    logoHeight: undefined,
  });
});

test('removing a sponsor preserves existing project selections', () => {
  const next = removeSponsor(data, firstSponsor.id);

  assert.deepEqual(next.sponsors, [secondSponsor]);
  assert.equal(next.projects, data.projects);
  assert.deepEqual(next.projects[0].sponsorIds, [
    firstSponsor.id,
    secondSponsor.id,
  ]);
});

test('saved graphics includes only projects with a successful export', () => {
  const draft = { ...project, id: 'draft', exportedAt: undefined };
  const saved = {
    ...project,
    id: 'saved',
    exportedAt: '2026-07-25T10:00:00.000Z',
  };
  const next = { ...data, projects: [draft, saved] };

  assert.deepEqual(getSavedProjects(next), [saved]);
});

test('renaming a saved graphic targets one project and records the update time', () => {
  const first = {
    ...project,
    id: 'saved-one',
    name: 'Old name',
    exportedAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
  };
  const second = { ...first, id: 'saved-two', name: 'Second graphic' };
  const next = renameSavedProject(
    { ...data, projects: [first, second] },
    first.id,
    'New name',
    '2026-07-25T11:00:00.000Z',
  );

  assert.deepEqual(next.projects[0], {
    ...first,
    name: 'New name',
    updatedAt: '2026-07-25T11:00:00.000Z',
  });
  assert.equal(next.projects[1], second);
});

test('cancelling saved graphic deletion preserves the existing data object', () => {
  const saved = {
    ...project,
    name: 'Race Day',
    exportedAt: '2026-07-25T10:00:00.000Z',
  };
  let prompt = '';
  const next = removeSavedProject(
    { ...data, projects: [saved] },
    saved.id,
    message => {
      prompt = message;
      return false;
    },
  );

  assert.equal(prompt, 'Delete "Race Day" from Saved Graphics?');
  assert.equal(next.projects[0], saved);
});

test('confirming saved graphic deletion removes only the selected project', () => {
  const first = {
    ...project,
    id: 'saved-one',
    name: 'Race Day',
    exportedAt: '2026-07-25T10:00:00.000Z',
  };
  const second = { ...first, id: 'saved-two', name: 'Event Poster' };
  const current = { ...data, projects: [first, second] };
  const next = removeSavedProject(current, first.id, () => true);

  assert.deepEqual(next.projects, [second]);
  assert.equal(next.profile, current.profile);
  assert.equal(next.branding, current.branding);
  assert.equal(next.sponsors, current.sponsors);
});

test('draft projects cannot be removed through Saved Graphics actions', () => {
  const draft = { ...project, id: 'draft', exportedAt: undefined };
  const current = { ...data, projects: [draft] };
  let asked = false;
  const next = removeSavedProject(current, draft.id, () => {
    asked = true;
    return true;
  });

  assert.equal(next, current);
  assert.equal(asked, false);
});
