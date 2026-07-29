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
const { GRAPHIC_ELEMENTS } = await server.ssrLoadModule(
  '/src/components/builder/GraphicElements.tsx',
);

after(() => server.close());

const data: Data = {
  onboardingComplete: true,
  profile: {
    name: 'Rich Weatherill',
    number: '46',
    team: 'T6 Msport',
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
  scheduleDayCount: 1,
  scheduleDays: [
    {
      day: 'Saturday',
      sessions: [
        { type: 'Practice', time: '18:30' },
        { type: 'Qualifying', time: '19:00' },
        { type: 'Race', time: '19:30' },
        { type: 'Race', time: '20:00' },
        { type: 'Race', time: '20:30' },
      ],
    },
  ],
};

const templates: TemplateId[] = [
  'event',
  'announcement',
  'schedule',
  'results',
  'sponsor',
];
const formats: FormatId[] = ['story', 'feed'];

const expectedHashes: Record<string, string> = {
  'event:story':
    '9f04a26920adb96f5d4a64344721c89a0ed0ce3069ebbee734a3613c24c10957',
  'event:feed':
    'd930f6b2f60f028f3cb932fa8a4600332cee9af974231a5ad2945e1372ffb05f',
  'announcement:story':
    'd3ea7d6941212ef14ed4c73bccde9a9d63a28b10e5badeca4c26b50bd7c41d87',
  'announcement:feed':
    '43221ad040562ccfd1b0505eae866c688dfa40fe4687f093d3de1aed942729ba',
  'schedule:story':
    '3da9e59e75e51bfb68d943312e50852f21cc559b285d5eb09c73f0002a339ee1',
  'schedule:feed':
    '45c342509e60270fe00039847d77757db3357dae43d08c5c3d5268ce91fbc106',
  'results:story':
    'f2775a1f722dbd03ecb6aaba93473e3c0a31bf48dad488c6ddfc3c79cdcdaf8c',
  'results:feed':
    '8a91ff6d718b9a4d1a9cb2badda2d5c65042dc865390c7f3c0e429917bc6eb57',
  'sponsor:story':
    '8680fca25fd5599a4b1050adb476b0594fa5ffd20952dbe887feeb1e57e6a90e',
  'sponsor:feed':
    'bb1bff5f74e41e905d4ba0c3b67d691eecb886bc4d7a664b5b849f1ef7dbe1d2',
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
    graphicElement: 'none',
    graphicElementX: 50,
    graphicElementY: 55,
    graphicElementSize: 45,
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
      assert.match(
        markup,
        /<linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">/,
      );
      assert.match(markup, /fill="url\(#topFade\)"/);
      assert.match(markup, /data:image\/png;base64,driver/);
      assert.match(markup, /data:image\/png;base64,corbeau/);
      assert.match(markup, /data:image\/png;base64,competition/);
      assert.match(markup, /data:image\/png;base64,team/);
      assert.doesNotMatch(markup, /data-graphic-element=/);
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
        assert.match(markup, /lengthAdjust="spacingAndGlyphs"/);
        assert.match(markup, /text-anchor="end" dominant-baseline="hanging"/);
      }
      if (template === 'announcement') {
        assert.match(markup, /id="announcement-text-background"/);
        assert.match(
          markup,
          /fill="url\(#announcement-text-background\)"/,
        );
      }
      if (template === 'schedule') {
        assert.match(
          markup,
          /text-anchor="middle" dominant-baseline="central"/,
        );
      }
      if (template === 'results') {
        assert.match(markup, /RACE 1 RESULT/);
        assert.match(markup, /ROUND 3/);
        assert.match(markup, />P</);
        assert.match(markup, />2</);
        assert.match(markup, /skewX\(-12\)/);
        assert.match(markup, /data-podium-wreath="2"/);
        assert.match(markup, /flood-color="#c3c8cf"/);
        assert.match(markup, /<text x="0" y="0" text-anchor="middle">/);
        assert.match(markup, /<tspan dx="(?:40|48)">2<\/tspan>/);
        assert.doesNotMatch(markup, /stroke="#08090a"/);
      }
    });
  }
}

test('qualifying result restores identity and centres the combined position composition', () => {
  const project = makeProject('results', 'story');
  project.details = {
    ...project.details,
    circuit: 'Silverstone National',
    position: 'P1',
    resultSession: 'qualifying',
  };

  const markup = renderToStaticMarkup(
    createElement(Graphic, {
      project,
      data,
      sponsors,
      ref: null,
    }),
  );

  assert.match(markup, /QUALIFYING RESULT/);
  assert.match(markup, /SILVERSTONE NATIONAL/);
  assert.match(markup, />P</);
  assert.match(markup, />1</);
  assert.match(markup, /skewX\(-12\)/);
  assert.match(markup, /<text x="0" y="0" text-anchor="middle">/);
  assert.match(markup, /<tspan dx="48">1<\/tspan>/);
  assert.match(markup, /data-podium-wreath="1"/);
  assert.match(markup, /flood-color="#8b5cf6"/);
  assert.match(markup, /opacity="1"/);
  assert.doesNotMatch(markup, /stroke="#08090a"/);
  assert.doesNotMatch(markup, /paint-order="stroke fill"/);
  assert.match(markup, /RICH WEATHERILL/);
  assert.match(markup, /data:image\/png;base64,competition/);
  assert.doesNotMatch(markup, /ROUND 3/);
  assert.doesNotMatch(markup, /pole-stopwatch/);
  assert.doesNotMatch(markup, />POLE</);
});

test('catalogue exposes 20 optional graphical elements', () => {
  assert.equal(GRAPHIC_ELEMENTS.length, 20);
  assert.equal(new Set(GRAPHIC_ELEMENTS.map((item: { id: string }) => item.id)).size, 20);
});

test('selected graphical element uses percentage placement and size controls', () => {
  const project = makeProject('event', 'feed');
  project.graphicElement = 'chevrons';
  project.graphicElementX = 25;
  project.graphicElementY = 70;
  project.graphicElementSize = 60;

  const markup = renderToStaticMarkup(
    createElement(Graphic, {
      project,
      data,
      sponsors,
      ref: null,
    }),
  );

  assert.match(markup, /data-graphic-element="chevrons"/);
  assert.match(
    markup,
    /transform="translate\(270 945\) scale\(6\.48\) translate\(-50 -50\)"/,
  );
});
