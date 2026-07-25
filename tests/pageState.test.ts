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
  removeSponsor,
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
