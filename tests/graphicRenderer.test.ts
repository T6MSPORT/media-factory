import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import type { Data, FormatId, Project, Sponsor, TemplateId } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { Graphic } = await server.ssrLoadModule(
  '/src/components/builder/Graphic.tsx',
);

after(() => server.close());

const data: Data = {
  onboardingComplete: true,
  profile: {
    name: 'Rich Weatherill',
    number: '46',
    team: 'T6 Msport',
    car: 'Cupra',
    location: 'West Yorkshire',
    age: '40',
    driverImage: 'data:image/png;base64,driver',
    teamLogo: 'data:image/png;base64,team',
    competitionLogo: 'data:image/png;base64,competition',
  },
  branding: {
    primary: '#c70000',
    secondary: '#111111',
    accent: '#ffffff',
    headingFont: 'Microgramma',
    bodyFont: 'Aldrich',
    sponsorLogoScale: 1,
  },
  sponsors: [],
  projects: [],
};

const sponsors: Sponsor[] = [
  {
    id: 'corbeau',
    name: 'Corbeau',
    logo: 'data:image/png;base64,corbeau',
    logoWidth: 400,
    logoHeight: 100,
  },
  {
    id: 'edge',
    name: 'Esports Edge',
  },
];

const details = {
  eventName: '',
  round: '3',
  circuit: 'Bathurst',
  date: '2026-09-06',
  time: '19:30',
  headline: '',
  subheadline: '',
  result: 'Second place',
  position: 'P2',
  scheduleLines: 'QUALIFYING · 19:30',
  sponsorName: 'Corbeau',
};

const templates: TemplateId[] = [
  'event',
  'announcement',
  'bio',
  'schedule',
  'qualifying',
  'results',
  'sponsor',
];
const formats: FormatId[] = ['story', 'feed'];

const expectedHashes: Record<string, string> = {
  'event:story':
    'ecbe52a35ae10fd96abd3f10a22056068f6e40f616d128edd921a92e4de13923',
  'event:feed':
    '54c2a75361c193096a7c3a12f7c2dcfa40ab8f1b06a3421da75981ab18de9798',
  'announcement:story':
    '52811445bc8b04519eb83c5f2c7f00a8fe4da092e911fd346e86c966a39bb139',
  'announcement:feed':
    '37145925e6628d938896e4bc0d64c9ac8848deb884f8f89d13fdde74107d8899',
  'bio:story':
    '5779aab7fe7bb9f3df3e346d0e3740e10db2eb6c924b9cfdea8ba27a0e299ec8',
  'bio:feed':
    '8acb11043fa5557db67df5d24339371fb6ea9251352b18071508fcad70d35522',
  'schedule:story':
    'f896516070ca34b1a11d2ad4647dd90659753f3e3327da06e6ed9c8207eeef40',
  'schedule:feed':
    '6538bac1925e061a89edda3d3530c7ac9fe5503df53e9d927bcd8ff5c248787a',
  'qualifying:story':
    '68de73d69cb931be8b60345d1b62fc12478d5b7260d0c4d19cefad02eaa3577d',
  'qualifying:feed':
    'ef3217bba44f66bac36777318efbb0156c08d16a72221be37e0da527095b1bd1',
  'results:story':
    '117f64f802c1b5e7a59c2bf624b4985dbf7647fd663ae6090d5687cafe53e2ee',
  'results:feed':
    '1da6656fef99fbf081f9774987973fbf2435c6a697862eca1d1f5aded610d0ea',
  'sponsor:story':
    'f1379d47d84ccc75b8578102d9d402e921b9f7656a2e2d9520787b0f70dbc952',
  'sponsor:feed':
    '23dbc484f9c747c28152123a9cdd907b96786cc2d2e3fe241f4699a0ba086857',
};

function makeProject(template: TemplateId, format: FormatId): Project {
  return {
    id: `${template}-${format}`,
    name: 'Graphic',
    template,
    format,
    sponsorIds: sponsors.map(sponsor => sponsor.id),
    createdAt: '',
    updatedAt: '',
    heroImage: 'data:image/png;base64,hero',
    heroImageWidth: 1920,
    heroImageHeight: 1080,
    heroX: 30,
    heroY: -20,
    heroScale: 1.2,
    heroFlip: false,
    driverX: 12,
    driverY: 24,
    driverScale: 1.1,
    driverVisible: true,
    details,
  };
}

function hash(markup: string) {
  return createHash('sha256').update(markup).digest('hex');
}

for (const template of templates) {
  for (const format of formats) {
    const key = `${template}:${format}`;

    test(`full SVG output remains stable for ${key}`, () => {
      const markup = renderToStaticMarkup(
        createElement(Graphic, {
          project: makeProject(template, format),
          data,
          sponsors,
          ref: null,
        }),
      );
      const outputHash = hash(markup);

      if (process.env.UPDATE_RENDERER_HASHES) {
        console.log(`${key} ${outputHash}`);
        return;
      }

      assert.equal(outputHash, expectedHashes[key]);
      assert.match(markup, /^<svg /);
      assert.match(markup, /class="graphic"/);
      assert.match(markup, /data:image\/png;base64,driver/);
      assert.match(markup, /data:image\/png;base64,corbeau/);
      if (template === 'event') {
        assert.match(
          markup,
          format === 'story'
            ? /width="500" height="260"/
            : /width="420" height="220"/,
        );
      }
    });
  }
}
