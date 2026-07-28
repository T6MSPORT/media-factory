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
    '43f0dbb6d49a41f6c02fcfadfc634a360926233726be9e2d5813db994925e3cf',
  'event:feed':
    'fef7a08e54958faee3aefe196c9135b80ea512bb05dffb6997ce89c46eafcfa1',
  'announcement:story':
    'aebcc245913b5cba11f4119be178540b10ae2ab90453bee6996ba2efcb130ce5',
  'announcement:feed':
    'dd6132c18166f76765c67e90363f56031f017e57ba2b87eb488304609b393e7b',
  'bio:story':
    'a0b72bcf8e53cbdc64dbdb1e759bc29aadafb7e39ee3b1bb45c088719b3edb54',
  'bio:feed':
    'b91b39f4c238977032eaca7407c3deb639c6161ed97ccbf775ec2a6e08375aa7',
  'schedule:story':
    '68bd205e164955a6a9580b5c4ff318f2b35c25827b16b026b07549fdf623c8bf',
  'schedule:feed':
    '9e012dfbf61388bdee39c3d981037372d75aa1e10e7ae0d2142ca72d214e989b',
  'qualifying:story':
    'b1dc9c1080cad80682ec09f53c97f48a4fe85e91c7a742de7e7389d1194da1bf',
  'qualifying:feed':
    '4b75df755315fa79c12065db9834c2f62b919219948279a1824ccfe3df949d84',
  'results:story':
    '75a2165c0b3e9753d35284c8d16095913d335028738a4359274b1ba3f8b499bf',
  'results:feed':
    '5a8044644d9b0240083fb9011db122c049d1c0b2a9a1692660d23e0c94bc47f0',
  'sponsor:story':
    '4ac951c86aa8d40357a212c3dd87ca5424eebe314829433dcdc97ec87e73ad94',
  'sponsor:feed':
    'b523edfdf34d802cbb2131ebccb9b97f376b7db692395121d0ff579edbd02e10',
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
          ? /width="500" height="260"/
          : /width="420" height="220"/,
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
