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
    '75f653974b988bda3c64d9975b65f06c2ba6bb4065e930de3f9cc9f478a8df48',
  'event:feed':
    '2bb608d58273430cc8eb677c879699ae220a73cd39949d980f977f943381482e',
  'announcement:story':
    '538ac8a4f71595d359dd7f170cbe57fd5cb240ad63ab8861259b043612743bec',
  'announcement:feed':
    'f1057b2e9276451fffb940d5ef33531af51c94c2de61497bbffbfd8eb284d21e',
  'bio:story':
    '42bdb434d22be5fd12388998136c8d413e5f126d17dc9977374b5c81bbe02062',
  'bio:feed':
    '50a09f17572a566720dba8b0a940b0a9b4b578791ec3f662948ae98608b1d71f',
  'schedule:story':
    '4166972b9e811f7f5d9e3024e7f114d9da564f34ab558a745fd6735dfaa68661',
  'schedule:feed':
    'c2cf02f6297c6e5becd073f8f13f34d4f1cb8aaa54d269725127334476c6d152',
  'qualifying:story':
    '017ed3f97d301f48c0d8ce6933bd5abd24a8c2ee2cbf3a755d14dcff9024840e',
  'qualifying:feed':
    'f1606f308820d83374b311d31d27a0fbe9c416e00f757f995b046882a31ff3d6',
  'results:story':
    '7343ca7282a1e5e1e705205a99ae69d95883ddbd36fbba33f5f7fed9c4f6b57f',
  'results:feed':
    'a9de274b878962456914b6d8cad8d1565b61b55c658070eff4c07ca210f8d498',
  'sponsor:story':
    'c7aa6fbc1fa621288f7e00922bae0a097c8d1534e91b4d0d28a3571f2381b6d1',
  'sponsor:feed':
    'e4f2b11c82974403450b9fa6be7664304e10d6f2411f3ba123ad290f62bb214d',
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
        assert.doesNotMatch(markup, /<rect[^>]*stroke=/);
        assert.match(markup, /transform="skewX\(-14\)"/);
        assert.match(markup, /fill="#c70000" transform="skewX\(-14\)"/);
        assert.match(markup, /text-anchor="end" dominant-baseline="hanging"/);
        assert.match(markup, /preserveAspectRatio="xMaxYMin meet"/);
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
