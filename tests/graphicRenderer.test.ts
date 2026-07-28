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
    '21cb0781b5b767eac1603d81a2ebc377e9ae2fe32ff2f61baec5eed004600370',
  'event:feed':
    '9ab6a67c49365eb08577c8906fb8395d9ca01946c18bc499ab33117fa7f08faa',
  'announcement:story':
    '26b66021cd5ea16f3c89bda15f5783394973b27da25cd8abf33e3d51724ce6d8',
  'announcement:feed':
    '1e2b88bceaccf7fa91ef68ea6cfb0557e8986ecefe92e5d5bd79eb734580cd44',
  'bio:story':
    '36944869a1aa57b6cbcf7b15f5e0879a30a46dd6ba38a910675af6e2865ac9e3',
  'bio:feed':
    'c8b7d17872285f5849ff73b0bb4a364b992b9ca33777d3fa696255189179d696',
  'schedule:story':
    'c2254ec9c450450e654df7e383afa4b12d1feb921c93ec648aba685742099922',
  'schedule:feed':
    '55832e798a2fa9308da8528a72948e03120673a85d56be0e0ce1674e9e914d75',
  'qualifying:story':
    'f8feb67ea775ee9506e8448afea5516ff932869d72a3d9ee6b39457b80fa9ab9',
  'qualifying:feed':
    'b554eaa0d0405f734444c30a78fdf12c014d483fabdfdf189deddeda40b537ae',
  'results:story':
    'a58fa6eff8f9ddf7db3189c97d7676e019373f499b1109876d093efd3f8058d4',
  'results:feed':
    'e9f4681f26c67edf6a1c001f9ba946d3b307517ea2bf80ee3be6fdba5cd4b2b4',
  'sponsor:story':
    '4481b7343b12eed4cbfee2d0c6d2f51e44e6f1885dbaf9b3061bf7737a6f394b',
  'sponsor:feed':
    '03899248d11d313a3ad959894cc6380e116714e1dcafe9945778e25e8c4dd861',
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
