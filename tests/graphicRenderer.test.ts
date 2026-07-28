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
    '49cab7f5174b81c20c9cb597e164a8da689b8e08427476b1b4ca66d0803deb4a',
  'event:feed':
    'b9e3fefd17a0d910f62c410e01f234da9483e70aab5b9ce790b9a88c4404f69b',
  'announcement:story':
    '828162a4052f5dfa86c523d64e8dcdd5a414b1aa6b4901635be8e227c00a8b02',
  'announcement:feed':
    '17ff7923854035de54d184e925b56238b0519cda0a807834947225066d05ed3b',
  'bio:story':
    '23e38530c2582142f04e06dc18b67a29cff7fc37ca6bc45a4b24c47f46e99600',
  'bio:feed':
    '7d1bca5a7fa5c963726360bee533e4a59ed4a5f9d56191cc9b07f452c76eae60',
  'schedule:story':
    '30b2dd14e45c0f811cf8be20159afddda44565eef90b886d8fdc27ceb1868aef',
  'schedule:feed':
    '4d51b61fe016c2300de9e83534efacc82f63fde01e0aa53bf264b75c7b9b848e',
  'qualifying:story':
    '0a4f1e09bb9a37ff14053705bd318c2f63c9aab3f55dce1e8906a34d80434f2d',
  'qualifying:feed':
    '1d7205d64f2c7fa8c8edaf9c0f7b8a94fc811cc9cd9873a394a423842a809b00',
  'results:story':
    '35776389e79722f10b3db266ae6f05978aa4cb51cdbf8e46dd825153af7dab36',
  'results:feed':
    'f652e9fa7c48e5ca4a7d38c6d660517e5e6a593e1ffbb9f955141db2eba734b8',
  'sponsor:story':
    '46bc4dff0ced886ef49a438ae0d4204eb49727d555736d4303bc3eeecafc9bb8',
  'sponsor:feed':
    '79e649c3caca6493f4659c303c0b07e2b1a8fd5dcd419caf63ca855dcfdb795c',
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
