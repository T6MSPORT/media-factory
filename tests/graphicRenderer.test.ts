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
const { BackgroundLayers } = await server.ssrLoadModule(
  '/src/components/builder/GraphicLayers.tsx',
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
    '0c29641bc1c902b9b9430956cd70629906c55d838000ff96844f49a0274371d0',
  'event:feed':
    'bb97d3812d32e48cd8512ce0e3251a767663ae2d36135b1b8d5faa55562f856e',
  'announcement:story':
    'cf6e3694dd8815ea3050f977ddc772854ae35eeedb9360916a70ae3c38408c21',
  'announcement:feed':
    '29d6ce37713478f847741e2f729748dff1c01c567747030dd3559f56a376b06c',
  'schedule:story':
    '33d928add1b8d8d010b5666edb85c43661042e6c042d441bf962374e5c6bf63f',
  'schedule:feed':
    'c3848779c5594962e9162907d6ad2794aa9948390658eec9c3a00d2f443a1ce4',
  'results:story':
    'af9159c8bad3ea64baac99017dfc0587a5765a015b6d0ef1b69068e10db7c7d3',
  'results:feed':
    '026d0e302c96480f5e685ece40f77563d8567405989b8584edde2209724f2efe',
  'sponsor:story':
    '65c4f534cff3f40698d9f9c61d456198214655e24c66757d8b78512c554ad2ca',
  'sponsor:feed':
    '9ceed0282ab2704b26e76bcd37a5be2e8a378cbe2dc965aa12991c43b4a42bd6',
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
        assert.doesNotMatch(markup, /stroke="#080808"/);
        assert.doesNotMatch(markup, /paint-order="stroke fill"/);
        assert.match(markup, /lengthAdjust="spacingAndGlyphs"/);
        assert.match(markup, /text-anchor="end" dominant-baseline="hanging"/);
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
      if (template === 'sponsor') {
        assert.match(markup, /PROUDLY SUPPORTED BY/);
        assert.match(markup, /data-featured-sponsor="corbeau"/);
        assert.match(
          markup,
          format === 'story'
            ? /data-featured-sponsor="corbeau"[^>]*x="70"[^>]*width="940" height="520"/
            : /data-featured-sponsor="corbeau"[^>]*x="70"[^>]*width="940" height="390"/,
        );
        assert.ok(
          markup.indexOf('PROUDLY SUPPORTED BY') <
            markup.indexOf('data-featured-sponsor="corbeau"'),
        );
      }
    });
  }
}

test('hero black overlay uses the selected opacity above the image', () => {
  const project = makeProject('event', 'feed');
  project.heroOverlayOpacity = 35;

  const markup = renderToStaticMarkup(
    createElement(BackgroundLayers, {
      w: 1080,
      h: 1350,
      project,
      branding: data.branding,
      loadedHeroSize: { width: 1920, height: 1080 },
    }),
  );

  assert.match(
    markup,
    /data-hero-black-overlay="true"[^>]*fill="#000000"[^>]*opacity="0\.35"/,
  );
});

test('announcement opacity and sponsor product placement render from controls', () => {
  const announcement = makeProject('announcement', 'feed');
  announcement.details = {
    ...announcement.details,
    announcementBackgroundOpacity: 75,
  };
  const announcementMarkup = renderToStaticMarkup(
    createElement(Graphic, { project: announcement, data, sponsors, ref: null }),
  );

  const sponsor = makeProject('sponsor', 'square');
  sponsor.details = {
    ...sponsor.details,
    sponsorLogoScale: 1.25,
    sponsorLogoY: 50,
    productImages: [
      'data:image/png;base64,product-one',
      'data:image/png;base64,product-two',
      'data:image/png;base64,product-three',
    ],
  };
  const sponsorMarkup = renderToStaticMarkup(
    createElement(Graphic, { project: sponsor, data, sponsors, ref: null }),
  );
  assert.match(sponsorMarkup, /viewBox="0 0 1080 1080"/);
  assert.match(sponsorMarkup, /data-featured-sponsor="corbeau"[^>]*width="1175"/);
  assert.equal((sponsorMarkup.match(/data-product-placement=/g) || []).length, 3);
  assert.match(sponsorMarkup, /data:image\/png;base64,product-three/);
});

test('qualifying result restores identity and centres the combined position composition', () => {
  const project = makeProject('results', 'story');
  project.details = {
    ...project.details,
    circuit: 'Silverstone National',
    position: 'P1',
    resultSession: 'qualifying',
    raceNumber: '3',
  };

  const markup = renderToStaticMarkup(
    createElement(Graphic, {
      project,
      data,
      sponsors,
      ref: null,
    }),
  );

  assert.match(markup, /RACE 3 QUALIFYING RESULT/);
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

test('replacement set uses the new motorsport background compositions', () => {
  const replacements = {
    'speed-lines': 'M-65 13 H55 L83 38',
    grid: 'M-43 9 H-18 V42',
    'dot-matrix': 'M-57 19 H82 L97 32',
    crosshair: 'M-59 9 H50 L62 21',
    diamond: 'M-58 15 H36 L58 35',
    hexagon: 'M-59 13 H19 L31 25',
    'circle-ring': 'M-58 93 L-33 64',
    triangle: 'M-61 88 L5 12',
  } as const;

  for (const [graphicElement, signature] of Object.entries(replacements)) {
    const project = makeProject('driver', 'feed');
    project.graphicElement = graphicElement as Project['graphicElement'];

    const markup = renderToStaticMarkup(
      createElement(Graphic, {
        project,
        data,
        sponsors,
        ref: null,
      }),
    );

    assert.match(markup, new RegExp(`data-graphic-element="${graphicElement}"`));
    assert.ok(markup.includes(signature));
  }
});

test('late apex keeps the racing curve without the angled marker', () => {
  const project = makeProject('driver', 'feed');
  project.graphicElement = 'apex-arc';

  const markup = renderToStaticMarkup(
    createElement(Graphic, {
      project,
      data,
      sponsors,
      ref: null,
    }),
  );

  assert.match(markup, /data-graphic-element="apex-arc"/);
  assert.match(markup, /C-22 27 31 -1 151 8/);
  assert.doesNotMatch(markup, /M4 67 L18 47 L39 45/);
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
