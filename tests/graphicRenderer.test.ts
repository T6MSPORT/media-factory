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
    'f9b7ce5e2d076704efc13757a7070a6d64ee4d626e4a5ee0c81b227c3f05c389',
  'event:feed':
    '87280957e814b61e39a1498c8dadd7eeccf83fe6196734838f61f76cdae2d78d',
  'announcement:story':
    'ccf1e7c3a56c5029aec645734296e23368d8029a42bfcaaf0fe4c9d37aa97046',
  'announcement:feed':
    '91c02badb7d3bec7930e1693644c3dd09fb892b39795a55abe8681dc377a9402',
  'bio:story':
    '5779f26810800bfde3257bb64ae8d128b69cabb66bb1537100b06c011de30655',
  'bio:feed':
    'b7bb66d6f7ff6badf53aa7bca117460d58732943ed2404e8cc0a602a85c5a20c',
  'schedule:story':
    'adbacee674155504d9b7f539908935c5f9485b7f6f2ab4d983775613f0f29181',
  'schedule:feed':
    'f06ca3ee208759fd47aa0ca1e78f505334beb7b0d3f4571dd8b4fde40cc2c1b3',
  'qualifying:story':
    '101f08b2ec03cae8245da4fd01b55de2e26c1038a46d5bb1b97ba85f7fc3b12e',
  'qualifying:feed':
    '29b3445932bfb93ef24f3024783a6c30196ca71f90c4057a077cb78f2bb73e5c',
  'results:story':
    'de56bea4c6d56054dba0fd498fe5021cf3c2086b12982dc710f7c0839153f9ea',
  'results:feed':
    '5cf66192a5ad4794a0b4ac47cdc2dda4eba61e5d80a227df1768a922ce267b1f',
  'sponsor:story':
    'f837b31422234452a049513e8c0cff15c62048be1ee6f6fec1904bef09027f06',
  'sponsor:feed':
    'a50c422d953b9227bf5644293f6cb3f8b4c15ad738f8d05d2ec3f79321cfa6cf',
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
      assert.match(markup, /data:image\/png;base64,competition/);
      assert.match(markup, /data:image\/png;base64,team/);
      assert.match(markup, /RICH WEATHERILL/);
      assert.match(markup, />#46</);
      assert.match(markup, /transform="skewX\(-14\)"/);
      assert.match(markup, /fill="#c70000" transform="skewX\(-14\)"/);
      assert.match(markup, /preserveAspectRatio="xMaxYMin meet"/);
      assert.match(
        markup,
        format === 'story'
          ? /width="450" height="234"/
          : /width="378" height="198"/,
      );
      if (template === 'event') {
        assert.doesNotMatch(markup, /<rect[^>]*stroke=/);
        assert.doesNotMatch(markup, /next-race-event-contrast/);
        assert.match(markup, /stroke="#080808"/);
        assert.match(markup, /paint-order="stroke fill"/);
        assert.match(markup, /text-anchor="end" dominant-baseline="hanging"/);
      }
    });
  }
}
