import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatRoundLabel,
  getBackgroundLayout,
  getAnnouncementTemplateLayout,
  getBrandLogoLayout,
  getEventTemplateLayout,
  getGraphicCopy,
  getResultsTemplateLayout,
  getScheduleTemplateLayout,
  getSponsorLayout,
  getSponsorLayouts,
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
    eventIdentityRight: 1010,
    eventNameY: 70,
    eventIdentityGap: 4,
    eventIdentityLineHeightFactor: 0.76,
    eventNumberW: 330,
    eventNumberH: 88,
    eventNumberY: 108.96000000000001,
    eventNumberText: '#46',
    eventNumberSize: 84,
    eventNameSize: 46,
    eventNameText: 'RICH WEATHERILL',
    eventTeamW: 260,
    eventTeamOpticalOffset: 0,
    eventTeamX: 750,
    eventTeamY: 176.8,
    eventCompetitionY: 34,
    eventHeadingY: 540,
    eventNextSize: 96,
    eventRoundSize: 65,
    eventTrackMaxWidth: 940,
    eventTrackSize: 198,
    eventTrackTextLength: 823.6800000000001,
    eventTrackText: 'BATHURST',
    eventDateSize: 63,
    eventRoundY: 654,
    eventTrackY: 737,
    eventDateY: 953,
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

test('round labels use plural wording for every supported range format', () => {
  assert.equal(formatRoundLabel('3'), 'ROUND 3');
  assert.equal(formatRoundLabel('3 & 4'), 'ROUNDS 3 & 4');
  assert.equal(formatRoundLabel('3-4'), 'ROUNDS 3-4');
  assert.equal(formatRoundLabel('3–4'), 'ROUNDS 3–4');
  assert.equal(formatRoundLabel('3 to 4'), 'ROUNDS 3 TO 4');
});

test('event identity rows use tight spacing without overlapping', () => {
  for (const format of ['story', 'feed'] as const) {
    const layout = getEventTemplateLayout(
      1080,
      { ...project, format },
      profile,
    );

    assert.equal(
      layout.eventNumberY -
        (layout.eventNameY +
          layout.eventNameSize * layout.eventIdentityLineHeightFactor),
      layout.eventIdentityGap,
    );
    assert.equal(
      layout.eventTeamY -
        (layout.eventNumberY +
          layout.eventNumberSize * layout.eventIdentityLineHeightFactor),
      layout.eventIdentityGap - layout.eventTeamOpticalOffset,
    );
    assert.equal(layout.eventIdentityGap, 4);
    assert.equal(layout.eventIdentityLineHeightFactor, 0.76);
    assert.equal(layout.eventTeamOpticalOffset, 0);
    assert.ok(layout.eventTeamY > layout.eventNumberY);
  }
});

test('event text fits long track names and three-digit car numbers inside their containers', () => {
  const layout = getEventTemplateLayout(
    1080,
    {
      ...project,
      format: 'feed',
      details: { ...details, circuit: 'Silverstone National' },
    },
    { ...profile, number: '333' },
  );

  assert.equal(layout.eventTrackText, 'SILVERSTONE NATIONAL');
  assert.equal(layout.eventTrackMaxWidth, 940);
  assert.ok(Math.abs(layout.eventTrackSize - 90.38462) < 0.001);
  assert.equal(layout.eventTrackTextLength, 940);
  assert.equal(layout.eventNumberText, '#333');
  assert.equal(layout.eventNumberSize, 72);
});

test('event layout keeps Donington National prominent while fitting the canvas', () => {
  for (const format of ['story', 'feed'] as const) {
    const layout = getEventTemplateLayout(
      1080,
      {
        ...project,
        format,
        details: { ...project.details, circuit: 'Donington National' },
      },
      profile,
    );

    assert.ok(layout.eventTrackSize >= 100);
    assert.ok(layout.eventTrackTextLength <= layout.eventTrackMaxWidth);
  }
});

test('event track text remains inside the template for every selectable heading font', () => {
  for (const headingFont of [
    'Orbitron',
    'Rajdhani',
    'Teko',
    'Oxanium',
    'Russo One',
  ]) {
    const layout = getEventTemplateLayout(
      1080,
      {
        ...project,
        details: {
          ...project.details,
          circuit: 'Silverstone International Circuit',
        },
      },
      profile,
    );

    assert.ok(
      layout.eventTrackTextLength <= layout.eventTrackMaxWidth,
      headingFont,
    );
    assert.ok(layout.eventTrackSize > 0, headingFont);
  }
});

test('derived headings leave results presentation to the combined results layout', () => {
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
      achievement: '',
      title: 'RESULT',
      sub: 'T6 Msport',
      headingFont: 'Microgramma, Arial, sans-serif',
      bodyFont: 'Aldrich, Arial, sans-serif',
    },
  );
});

test('announcement uses a full-width top heading and full-width fitted uppercase text block', () => {
  const announcement = getAnnouncementTemplateLayout(1080, 1920, {
    ...project,
    template: 'announcement',
    format: 'story',
    details: {
      ...details,
      subheadline:
        'PTEC welcomes a new championship partner for the forthcoming season.',
    },
  });

  assert.equal(announcement.title, 'ANNOUNCEMENT');
  assert.equal(announcement.titleX, 70);
  assert.equal(announcement.titleY, 350);
  assert.equal(announcement.titleMaxWidth, 940);
  assert.equal(announcement.textBoxWidth, 940);
  assert.equal(
    announcement.lines.join(' '),
    'PTEC WELCOMES A NEW CHAMPIONSHIP PARTNER FOR THE FORTHCOMING SEASON.',
  );
  assert.ok(announcement.lines.length > 1);
  assert.equal(announcement.textBackgroundX, announcement.textX - 24);
  assert.equal(announcement.textBackgroundY, announcement.textY - 20);
  assert.ok(announcement.textBackgroundWidth <= announcement.textBoxWidth + 48);
  assert.equal(
    announcement.textBackgroundHeight,
    announcement.textSize +
      (announcement.lines.length - 1) * announcement.textLineHeight +
      40,
  );
  assert.ok(
    announcement.lines.length *
      announcement.textSize *
      1.28 <=
      announcement.textBoxHeight,
  );
});

test('every template retains its default title and standard layout behaviour', () => {
  const expectedTitles: Record<TemplateId, string> = {
    event: 'RACE WEEKEND',
    announcement: 'ANNOUNCEMENT',
    schedule: 'RACE SCHEDULE',
    results: 'RESULT',
    sponsor: 'PROUDLY SUPPORTED BY',
  };

  assert.deepEqual(templateTitles, expectedTitles);

  for (const template of Object.keys(expectedTitles) as TemplateId[]) {
    const copy = getGraphicCopy(
      { ...project, template },
      { ...profile, team: '' },
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
      template: 'results',
    }).showResult,
    true,
  );
});

test('combined results layout switches qualifying and race presentation', () => {
  const qualifying = getResultsTemplateLayout(1080, 1920, {
    ...project,
    template: 'results',
    details: {
      ...details,
      circuit: 'Silverstone National',
      round: '4',
      position: 'P1',
      resultSession: 'qualifying',
    },
  });
  assert.equal(qualifying.title, 'QUALIFYING RESULT');
  assert.equal(qualifying.trackText, 'SILVERSTONE NATIONAL');
  assert.equal(qualifying.roundText, '');
  assert.equal(qualifying.positionText, 'P1');
  assert.equal(qualifying.isPole, true);
  assert.equal(qualifying.podiumPosition, 0);
  assert.equal(qualifying.titleY, 350);
  assert.equal(qualifying.positionY, 960);
  assert.equal(qualifying.stopwatchX, 540);
  assert.equal(qualifying.stopwatchY, 960);
  assert.equal(qualifying.poleTextY, 1205);

  const race = getResultsTemplateLayout(1080, 1920, {
    ...project,
    template: 'results',
    details: {
      ...details,
      round: '4',
      position: '2',
      resultSession: 'race',
    },
  });
  assert.equal(race.title, 'RACE RESULT');
  assert.equal(race.roundText, 'ROUND 4');
  assert.equal(race.positionText, 'P2');
  assert.equal(race.isPole, false);
  assert.equal(race.podiumPosition, 2);
  assert.equal(race.titleY, 350);
  assert.equal(race.positionY, 960);
});

test('schedule layout keeps the title and track at the top with selected days underneath', () => {
  const schedule = getScheduleTemplateLayout(1080, 1920, {
    ...project,
    template: 'schedule',
    details: {
      ...details,
      circuit: 'Silverstone National',
      round: '3 & 4',
      scheduleDayCount: 2,
      scheduleDays: [
        {
          day: 'Saturday',
          sessions: [
            { type: 'Practice', time: '18:00' },
            { type: '', time: '' },
            { type: 'Qualifying', time: '19:00' },
            { type: '', time: '' },
            { type: '', time: '' },
          ],
        },
        {
          day: 'Sunday',
          sessions: Array.from({ length: 5 }, () => ({
            type: 'Race',
            time: '19:30',
          })),
        },
      ],
    },
  });

  assert.equal(schedule.title, 'SCHEDULE');
  assert.equal(schedule.titleY, 350);
  assert.equal(schedule.trackText, 'SILVERSTONE NATIONAL');
  assert.equal(schedule.roundText, 'ROUNDS 3 & 4');
  assert.ok(schedule.trackY > schedule.titleY);
  assert.ok(schedule.roundY > schedule.trackY);
  assert.ok(schedule.daysY > schedule.roundY);
  assert.equal(schedule.days.length, 2);
  assert.deepEqual(schedule.days.map(day => day.day), ['Saturday', 'Sunday']);
  assert.equal(schedule.days[0].sessions.length, 2);
  assert.equal(schedule.days[1].sessions.length, 5);
  assert.deepEqual(
    schedule.days.flatMap(day => day.sessions.map(session => session.label)),
    ['PRACTICE', 'QUALIFYING', 'RACE 1', 'RACE 2', 'RACE 3', 'RACE 4', 'RACE 5'],
  );
  assert.ok(schedule.sessionSize >= 35);
  assert.ok(schedule.chevronStartX > schedule.contentWidth * 0.35);
  assert.ok(schedule.chevronEndX < schedule.contentWidth * 0.75);
  assert.equal(
    schedule.chevronStartX + schedule.chevronEndX,
    schedule.contentWidth,
  );
  assert.ok(schedule.chevronEndX > schedule.chevronStartX);
  assert.ok(schedule.chevronGap > 0);
  assert.equal(schedule.days[0].x, schedule.days[1].x);
  assert.ok(schedule.days[1].y > schedule.days[0].y);
});

test('template extras retain sponsor content', () => {
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
    'schedule',
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

test('mixed sponsor logo shapes keep equal visible gaps', () => {
  const layouts = getSponsorLayouts(
    1080,
    1350,
    [
      { id: 'square', name: 'Square', logoWidth: 100, logoHeight: 100 },
      { id: 'wide-1', name: 'Wide 1', logoWidth: 400, logoHeight: 100 },
      { id: 'wide-2', name: 'Wide 2', logoWidth: 300, logoHeight: 100 },
      { id: 'wide-3', name: 'Wide 3', logoWidth: 250, logoHeight: 100 },
    ],
    1,
  );

  const visibleGaps = layouts.slice(1).map(
    (layout, index) =>
      layout.logoX -
      (layouts[index].logoX + layouts[index].logoW),
  );

  visibleGaps.forEach((gap) => assert.equal(gap, 40));
  assert.ok(
    Math.abs(
      layouts[0].logoX -
        (1080 -
          (layouts.at(-1)!.logoX + layouts.at(-1)!.logoW)),
    ) < 1e-9,
  );
});

test('rectangular sponsor logos share one height while retaining aspect ratio', () => {
  const sponsors = [
    { id: 'wide-1', name: 'Wide 1', logoWidth: 400, logoHeight: 100 },
    { id: 'wide-2', name: 'Wide 2', logoWidth: 300, logoHeight: 100 },
    { id: 'wide-3', name: 'Wide 3', logoWidth: 250, logoHeight: 100 },
  ];
  const layouts = getSponsorLayouts(1080, 1350, sponsors, 1);

  layouts.forEach((layout, index) => {
    assert.equal(layout.logoH, 52);
    assert.equal(
      layout.logoW / layout.logoH,
      sponsors[index].logoWidth / sponsors[index].logoHeight,
    );
  });
});
