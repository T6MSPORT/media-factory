import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBackgroundLayout,
  getBrandLogoLayout,
  getEventTemplateLayout,
  getGraphicCopy,
  getSponsorLayout,
  getStandardTemplateLayout,
  getTemplateExtraLayout,
  templateTitles,
} from '../src/components/builder/rendererCalculations.ts';
import type { TemplateId } from '../src/types.ts';

const details = {
  eventName: '',
  round: '3',
  circuit: 'Bathurst',
  date: '2026-09-06',
  time: '19:30',
  headline: '',
  subheadline: '',
  result: '',
  position: '',
  scheduleLines: '',
  sponsorName: '',
};

const project = {
  id: 'project',
  name: 'Graphic',
  template: 'event' as const,
  format: 'story' as const,
  sponsorIds: [],
  createdAt: '',
  updatedAt: '',
  heroImage: 'data:image/png;base64,hero',
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

const profile = {
  name: 'Rich Weatherill',
  number: '46',
  team: 'T6 Msport',
  car: 'Cupra',
  location: 'West Yorkshire',
  age: '40',
  competitionLogo: 'data:image/png;base64,competition',
};

const branding = {
  primary: '#c70000',
  secondary: '#111111',
  accent: '#ffffff',
  headingFont: 'Microgramma',
  bodyFont: 'Aldrich',
  sponsorLogoScale: 1,
};

test('background geometry preserves fill-to-canvas sizing and manual controls', () => {
  const layout = getBackgroundLayout(1080, 1920, project, {
    width: 1920,
    height: 1080,
  });

  assert.equal(layout.renderedHeroWidth, 4095.9999999999995);
  assert.equal(layout.renderedHeroHeight, 2304);
  assert.equal(layout.renderedHeroX, -1477.9999999999998);
  assert.equal(layout.renderedHeroY, -212);
  assert.equal(
    layout.driverTransform,
    'translate(12 24) translate(712.8000000000001 883.2) scale(1.1) translate(-712.8000000000001 -883.2)',
  );
  assert.deepEqual(
    {
      stripeLeftTop: layout.stripeLeftTop,
      stripeRightTop: layout.stripeRightTop,
      stripeRightBottom: layout.stripeRightBottom,
      stripeLeftBottom: layout.stripeLeftBottom,
      stripeLineLeft: layout.stripeLineLeft,
      stripeLineRight: layout.stripeLineRight,
    },
    {
      stripeLeftTop: 1459.2,
      stripeRightTop: 960,
      stripeRightBottom: 1248,
      stripeLeftBottom: 1728,
      stripeLineLeft: 1516.8000000000002,
      stripeLineRight: 1017.6,
    },
  );
});

test('event layout preserves the approved story positions and round wording', () => {
  assert.deepEqual(getEventTemplateLayout(1080, project, profile), {
    isStory: true,
    eventBlockX: 70,
    eventIdentityY: 116,
    eventNumberW: 138,
    eventNumberH: 58,
    eventNameSize: 46,
    eventNameX: 230,
    eventNameText: 'RICH WEATHERILL',
    eventTeamW: 260,
    eventTeamX: 750,
    eventCompetitionY: 200,
    eventHeadingY: 510,
    eventNextSize: 64,
    eventRoundSize: 43,
    eventTrackSize: 198,
    eventDateSize: 42,
    eventRoundY: 610,
    eventTrackY: 689,
    eventDateY: 923,
    roundLabel: 'ROUND 3',
  });

  assert.equal(
    getEventTemplateLayout(
      1080,
      { ...project, details: { ...details, round: '3 & 4' } },
      profile,
    ).roundLabel,
    'ROUNDS 3 & 4',
  );
});

test('derived headings and achievement labels remain template-specific', () => {
  assert.deepEqual(
    getGraphicCopy(
      {
        ...project,
        template: 'results',
        details: { ...details, position: 'P2' },
      },
      profile,
      branding,
    ),
    {
      achievement: 'PODIUM · P2',
      title: 'RACE RESULT',
      sub: 'T6 Msport',
      headingFont: 'Microgramma, Arial, sans-serif',
      bodyFont: 'Aldrich, Arial, sans-serif',
    },
  );
});

test('every template retains its default title and standard layout behaviour', () => {
  const expectedTitles: Record<TemplateId, string> = {
    event: 'RACE WEEKEND',
    announcement: 'ANNOUNCEMENT',
    bio: 'DRIVER PROFILE',
    schedule: 'RACE SCHEDULE',
    qualifying: 'QUALIFYING RESULT',
    results: 'RACE RESULT',
    sponsor: 'PROUDLY SUPPORTED BY',
  };

  assert.deepEqual(templateTitles, expectedTitles);

  for (const template of Object.keys(expectedTitles) as TemplateId[]) {
    const copy = getGraphicCopy(
      { ...project, template },
      { ...profile, team: '', car: '' },
      branding,
    );
    assert.equal(copy.title, expectedTitles[template]);
    assert.equal(copy.sub, 'MOTORSPORT');
  }

  assert.deepEqual(getStandardTemplateLayout(1920, project), {
    titleY: 1094.3999999999999,
    titleSize: 82,
    subY: 1149.3999999999999,
    detailY: 1224.3999999999999,
    dateY: 1268.3999999999999,
    resultY: 1324.3999999999999,
    showRaceDetails: true,
    showResult: false,
  });
  assert.equal(
    getStandardTemplateLayout(1350, {
      format: 'portrait',
      template: 'bio',
    }).showRaceDetails,
    false,
  );
  assert.equal(
    getStandardTemplateLayout(1350, {
      format: 'portrait',
      template: 'qualifying',
    }).showResult,
    true,
  );
  assert.equal(
    getStandardTemplateLayout(1350, {
      format: 'portrait',
      template: 'results',
    }).showResult,
    true,
  );
});

test('template extras retain bio, schedule and sponsor content', () => {
  assert.deepEqual(
    getTemplateExtraLayout(
      1350,
      { ...project, template: 'bio' },
      profile,
    ),
    {
      kind: 'bio',
      rows: [
        { y: 1080, text: 'TEAM  T6 Msport' },
        { y: 1122, text: 'LOCATION  West Yorkshire' },
        { y: 1164, text: 'AGE  40' },
        { y: 1206, text: 'CAR  Cupra' },
      ],
    },
  );
  assert.deepEqual(
    getTemplateExtraLayout(
      1350,
      {
        ...project,
        template: 'schedule',
        details: { ...details, scheduleLines: 'QUALIFYING · 19:30' },
      },
      profile,
    ),
    { kind: 'schedule', y: 1012.5, text: 'QUALIFYING · 19:30' },
  );
  assert.deepEqual(
    getTemplateExtraLayout(
      1350,
      {
        ...project,
        template: 'sponsor',
        details: { ...details, sponsorName: 'Corbeau' },
      },
      profile,
    ),
    { kind: 'sponsor', y: 999, text: 'CORBEAU' },
  );
  assert.deepEqual(
    getTemplateExtraLayout(
      1350,
      { ...project, template: 'announcement' },
      profile,
    ),
    { kind: 'none' },
  );
});

test('brand logo positions remain shared across non-event templates', () => {
  assert.equal(getBrandLogoLayout(1080, 'event'), null);
  for (const template of [
    'announcement',
    'bio',
    'schedule',
    'qualifying',
    'results',
    'sponsor',
  ] as TemplateId[]) {
    assert.deepEqual(getBrandLogoLayout(1080, template), {
      competitionX: 710,
      teamX: 885,
      y: 35,
      width: 150,
      height: 150,
    });
  }
});

test('sponsor logos retain their adaptive row and contain calculations', () => {
  const layout = getSponsorLayout(
    1080,
    1350,
    6,
    5,
    { id: 'sponsor', name: 'Sponsor', logoWidth: 400, logoHeight: 100 },
    1,
  );

  assert.deepEqual(layout, {
    cellW: 216,
    cellX: 432,
    barTop: 1186,
    row: 1,
    rowH: 82,
    logoW: 174.35595774162695,
    logoH: 43.58898943540674,
    logoX: 452.8220211291865,
    logoY: 1287.2055052822966,
  });
});
