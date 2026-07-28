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
    '8b31abe5f0995d108064c52b39896be4481a5df46b0891a19b85b95697c61183',
  'event:feed':
    '2da7c20b4af435d4ae5c82ea2616d3997a8e2d7b08b0f65581582c8852b9baad',
  'announcement:story':
    'd4a03e82c4703ebcb702a57ba0b028de8636e1c982d3bbbe00d82d4433578a96',
  'announcement:feed':
    '9045544009966bb613cdb8dd8c4b06fb2f6edfe454747afa2037e4148c1d3ed8',
  'bio:story':
    '68fb1161c90748fac1bf2f05c06a42d5f5e2f181ca38776c8c871bd141fc3700',
  'bio:feed':
    '1ae88eb03bfedf6ec16011e03cc4186e410d3329f35758889a688a6342225b75',
  'schedule:story':
    'c63e442bb9a28c56742d6747e888c098e9c0ab0b05f87f083c70cedd1320a905',
  'schedule:feed':
    'e3d3b155436f158619610f5d11b04431879be754fbe5fc06d630e61e0ddb9bbf',
  'qualifying:story':
    '73959915fc7354830eb52a6f661d28bbb771a182369bb591083f17a2d95338e2',
  'qualifying:feed':
    'f3cab5509673324b9ce0668cad2b6186681befd16a6019ca9edf251304bab66c',
  'results:story':
    'd93e1cc0b9d9b09e1e90ab06141618d43750a492aaca90456fbd7a749aa482a0',
  'results:feed':
    'ab924f1f620f5316d30e75229b35e88ffd1fa2920449c644b0b491eb6c30233d',
  'sponsor:story':
    'be2e2f969f9e5a492024b2f639b76bebdc8c142f48ac37a93ccc8564dba773dc',
  'sponsor:feed':
    '51a100be1d1dd5670483f7322558fcbcbc84b5071c04b8c18f1825341ab1ba81',
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
