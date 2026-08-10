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
  addSponsor,
  getSavedProjects,
  renameSavedProject,
  updateProfile,
  updateSponsor,
} = await server.ssrLoadModule('/src/state/pageState.ts');
const { exportProjectPng, saveProjectDesign } = await server.ssrLoadModule(
  '/src/components/builder/builderInteractions.ts',
);
const { load, save, starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

test('complete driver-to-saved-graphic flow retains every approved state transition', async () => {
  let data = updateProfile(starter, {
    name: 'Rich Weatherill',
    number: '46',
    team: 'T6 Msport',
    driverImage: 'data:image/webp;base64,driver',
    teamLogo: 'data:image/webp;base64,team',
    competitionLogo: 'data:image/webp;base64,ptec',
  });
  data = completeOnboarding(data);
  data = addSponsor(data, () => 'sponsor-corbeau');
  data = updateSponsor(data, 'sponsor-corbeau', {
    name: 'Corbeau',
    logo: 'data:image/webp;base64,corbeau',
    logoWidth: 640,
    logoHeight: 240,
  });

  const project = createProject('event', data, {
    createId: () => 'graphic-bathurst',
    now: () => '2026-07-25T12:00:00.000Z',
  });
  data = addProject(data, project);
  data = updateProject(
    data,
    project.id,
    {
      name: 'Bathurst Event Poster',
      heroImage: 'data:image/webp;base64,bathurst',
      heroImageWidth: 2400,
      heroImageHeight: 1600,
      details: {
        ...project.details,
        eventName: 'PTEC Bathurst',
        round: '1',
        circuit: 'Mount Panorama',
        date: '2026-09-06',
      },
    },
    () => '2026-07-25T12:15:00.000Z',
  );

  const editedProject = data.projects[0];
  const exported = await exportProjectPng(
    {} as SVGSVGElement,
    editedProject,
    async () => {},
  );
  assert.equal(exported, true);
  const savePatches: Partial<Project>[] = [];
  saveProjectDesign(
    editedProject,
    patch => savePatches.push(patch),
    () => '2026-07-25T12:30:00.000Z',
  );
  data = updateProject(
    data,
    editedProject.id,
    savePatches[0],
    () => '2026-07-25T12:30:00.000Z',
  );

  assert.equal(data.onboardingComplete, true);
  assert.equal(data.profile.driverImage, 'data:image/webp;base64,driver');
  assert.deepEqual(data.projects[0].sponsorIds, ['sponsor-corbeau']);
  assert.equal(data.projects[0].details.circuit, 'Mount Panorama');
  assert.equal(data.projects[0].savedAt, '2026-07-25T12:30:00.000Z');
  assert.deepEqual(getSavedProjects(data), [data.projects[0]]);

  data = renameSavedProject(
    data,
    editedProject.id,
    'Bathurst Race Week',
    '2026-07-25T12:35:00.000Z',
  );
  const reopened = getSavedProjects(data)[0];
  assert.equal(reopened.name, 'Bathurst Race Week');
  assert.equal(reopened.template, 'event');
  assert.equal(reopened.heroImage, 'data:image/webp;base64,bathurst');
  assert.equal(reopened.details.eventName, 'PTEC Bathurst');
});

test('the complete flow survives autosave and reload without losing assets', () => {
  const project = createProject('announcement', starter, {
    createId: () => 'graphic-announcement',
    now: () => '2026-07-25T13:00:00.000Z',
  });
  const data: Data = {
    ...starter,
    onboardingComplete: true,
    profile: {
      ...starter.profile,
      name: 'Rich Weatherill',
      number: '46',
      driverImage: 'data:image/webp;base64,driver',
    },
    projects: [
      {
        ...project,
        savedAt: '2026-07-25T13:30:00.000Z',
        exportedAt: undefined,
      },
    ],
  };
  let stored = '';

  save(data, {
    setItem: (_key: string, value: string) => {
      stored = value;
    },
  });
  const restored = load({ getItem: () => stored });

  assert.deepEqual(restored, data);
  assert.equal(getSavedProjects(restored)[0].id, 'graphic-announcement');
});
