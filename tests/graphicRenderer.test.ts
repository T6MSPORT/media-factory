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
    '74b1902e1d4ccfa4c00623d0b1d95b204c3f54ddfb11f3e04d71ab1120311f52',
  'event:feed':
    '3af204cc8a4c9b6ad3fe5128be5f294875e2b8a7c744a13f76d5872c7db092e9',
  'announcement:story':
    'f42516575356495c31561c3a5060c007bd248ff7f6527cf9d4a7700fa8eaf0a1',
  'announcement:feed':
    '143bd8544b1dd554bed97c3099a4805608522ac0d4ab64ad4428085b1df3d5c5',
  'schedule:story':
    '4693d67e3cd14f433bad3875261a3e9c9315e27f5e181774bc5ee7f48e13bfb6',
  'schedule:feed':
    '0e33f21369d0acaa1626ffc36a699e2d3d493b56d37c5caf93e1d93bead57f08',
  'results:story':
    '179f169fd7e29c7fbd92f13b62caad053d47d7cce4ee0fe401fca69d6f96a0bf',
  'results:feed':
    'a54de2711081edc973ca2feac41550dd85d36192577a6ac160dbc01dd07ed5fc',
  'sponsor:story':
    '0c5435cb3f8dade5d190a68fcfccf341e6598da9fd9b2e44009b0974543e20d0',
  'sponsor:feed':
    'c4323e24523f85982a6a602ee3e03c7ff3e218ebe61e13a9e963c882b8381ff0',
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

test('catalogue exposes 20 original background graphics', () => {
  assert.equal(GRAPHIC_ELEMENTS.length, 20);
  assert.equal(new Set(GRAPHIC_ELEMENTS.map((item: { id: string }) => item.id)).size, 20);
  assert.ok(GRAPHIC_ELEMENTS.some(item => item.name === 'Racing Line'));
  assert.ok(GRAPHIC_ELEMENTS.some(item => item.name === 'Airflow'));
  assert.ok(GRAPHIC_ELEMENTS.some(item => item.name === 'Live Trace'));
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
  assert.match(markup, /data-graphic-role="background-graphic"/);
  assert.match(
    markup,
    /transform="translate\(270 945\) scale\(11\.664 6\.48\) translate\(-50 -50\)"/,
  );
});

test('graphical element is an original background composition behind the driver image', () => {
  const project = makeProject('driver', 'feed');
  project.graphicElement = 'racing-stripes';

  const markup = renderToStaticMarkup(
    createElement(Graphic, {
      project,
      data,
      sponsors,
      ref: null,
    }),
  );

  const elementIndex = markup.indexOf('data-graphic-role="background-graphic"');
  const driverIndex = markup.indexOf('data-driver-layer="foreground"');
  assert.ok(elementIndex > -1);
  assert.ok(driverIndex > elementIndex);
  assert.match(markup, /scale\(8\.748 4\.86\)/);
  assert.match(markup, /opacity="\.55"/);
  assert.match(markup, /mask="url\(#graphicBackdropMask\)"/);
  assert.doesNotMatch(markup, /patternUnits=/);
  assert.doesNotMatch(markup, /graphic-pattern-/);
  assert.match(markup, /C-12 83 4 58 28 31/);
});

test('chequered panel uses transparent gaps rather than white squares', () => {
  const project = makeProject('event', 'feed');
  project.graphicElement = 'checkered-panel';

  const markup = renderToStaticMarkup(
    createElement(Graphic, {
      project,
      data,
      sponsors,
      ref: null,
    }),
  );

  assert.match(markup, /data-graphic-element="checkered-panel"/);
  const elementMarkup = markup.match(
    /<g data-graphic-element="checkered-panel"[\s\S]*?<\/g><g fill=/,
  )?.[0] || '';
  assert.doesNotMatch(elementMarkup, /#ffffff/);
  assert.doesNotMatch(elementMarkup, /white/);
});
