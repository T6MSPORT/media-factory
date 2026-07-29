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
    '379ea9314d4db54c6ce1c0ded64658769ca6995e064343f378c34915d26f036f',
  'event:feed':
    '0db95560680f00778a69163c47a47910e90dc10055199fdbf7119032da7a4219',
  'announcement:story':
    '22ab05cdb5353aef6918a8217a7b98f761b1364069cbfde547ede91addc4f37e',
  'announcement:feed':
    'c703db614c36926edf64ea50a904c59c9d35494dc4cb91c06975e305b48803ca',
  'schedule:story':
    '3da9e59e75e51bfb68d943312e50852f21cc559b285d5eb09c73f0002a339ee1',
  'schedule:feed':
    '45c342509e60270fe00039847d77757db3357dae43d08c5c3d5268ce91fbc106',
  'results:story':
    '3da1afdcb935504f1af4d87348822616823efc75ef8ae836300469f845486aab',
  'results:feed':
    '290cbc04e98a04da31a7eb1e339e6222c8c5aa10cac7517aee06b737fbd467cd',
  'sponsor:story':
    '6bd1f81de475cafe824290d43d51889f2fd0df0fb02938f07a336496869c1135',
  'sponsor:feed':
    'e45bce0e37bf70d1d324dad4872246d25a0bb9f3499ba5ecac241b1211285dfe',
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
      assert.match(
        markup,
        /<linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">/,
      );
      assert.match(markup, /fill="url\(#topFade\)"/);
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
  assert.doesNotMatch(markup, /stroke="#08090a"/);
  assert.doesNotMatch(markup, /paint-order="stroke fill"/);
  assert.match(markup, /RICH WEATHERILL/);
  assert.match(markup, /data:image\/png;base64,competition/);
  assert.doesNotMatch(markup, /ROUND 3/);
  assert.doesNotMatch(markup, /pole-stopwatch/);
  assert.doesNotMatch(markup, />POLE</);
});
