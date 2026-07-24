import type {
  Branding,
  DriverProfile,
  Project,
  Sponsor,
  TemplateId,
} from '../../types';

type Size = { width: number; height: number };

const templateTitles = {
  event: 'RACE WEEKEND',
  announcement: 'ANNOUNCEMENT',
  bio: 'DRIVER PROFILE',
  schedule: 'RACE SCHEDULE',
  qualifying: 'QUALIFYING RESULT',
  results: 'RACE RESULT',
  sponsor: 'PROUDLY SUPPORTED BY',
} satisfies Record<TemplateId, string>;

export function getGraphicCopy(
  project: Project,
  profile: DriverProfile,
  branding: Branding,
) {
  const numericPosition = Number(
    String(project.details.position).replace(/\D/g, ''),
  );
  const isPole = project.template === 'qualifying' && numericPosition === 1;
  const isPodium =
    project.template === 'results' &&
    numericPosition >= 1 &&
    numericPosition <= 3;
  const achievement = isPole
    ? 'POLE POSITION'
    : isPodium
      ? numericPosition === 1
        ? 'RACE WINNER'
        : `PODIUM · P${numericPosition}`
      : '';

  return {
    achievement,
    title: project.details.headline || templateTitles[project.template],
    sub:
      project.details.subheadline ||
      profile.team ||
      profile.car ||
      'MOTORSPORT',
    headingFont: `${branding.headingFont}, Arial, sans-serif`,
    bodyFont: `${branding.bodyFont}, Arial, sans-serif`,
  };
}

export function getBackgroundLayout(
  w: number,
  h: number,
  project: Project,
  loadedHeroSize: Size | null,
) {
  const heroWidth = loadedHeroSize?.width || project.heroImageWidth || w;
  const heroHeight = loadedHeroSize?.height || project.heroImageHeight || h;
  const fillScale = Math.max(w / heroWidth, h / heroHeight);
  const renderedHeroWidth = heroWidth * fillScale * project.heroScale;
  const renderedHeroHeight = heroHeight * fillScale * project.heroScale;
  const renderedHeroX = (w - renderedHeroWidth) / 2 + project.heroX;
  const renderedHeroY = (h - renderedHeroHeight) / 2 + project.heroY;
  const eventStripe = project.template === 'event';

  return {
    renderedHeroWidth,
    renderedHeroHeight,
    renderedHeroX,
    renderedHeroY,
    driverTransform: `translate(${project.driverX || 0} ${project.driverY || 0}) translate(${w * 0.66} ${h * 0.46}) scale(${project.driverScale || 1}) translate(${-w * 0.66} ${-h * 0.46})`,
    stripeLeftTop: h * (eventStripe ? 0.76 : 0.68),
    stripeRightTop: h * (eventStripe ? 0.5 : 0.42),
    stripeRightBottom: h * (eventStripe ? 0.65 : 0.57),
    stripeLeftBottom: h * (eventStripe ? 0.9 : 0.82),
    stripeLineLeft: h * (eventStripe ? 0.79 : 0.71),
    stripeLineRight: h * (eventStripe ? 0.53 : 0.45),
  };
}

export function getEventTemplateLayout(
  w: number,
  project: Project,
  profile: DriverProfile,
) {
  const isStory = project.format === 'story';
  const eventTop = isStory ? 70 : 58;
  const eventBlockX = 70;
  const eventIdentityY = eventTop + (isStory ? 46 : 40);
  const eventNumberW = isStory ? 138 : 122;
  const eventNumberH = isStory ? 58 : 52;
  const eventNameSize = isStory ? 46 : 40;
  const eventNameX = eventBlockX + eventNumberW + 22;
  const eventTeamW = isStory ? 260 : 220;
  const eventCompetitionY = eventIdentityY + (isStory ? 84 : 74);
  const eventHeadingY =
    eventCompetitionY +
    (profile.competitionLogo ? (isStory ? 310 : 255) : isStory ? 135 : 112);
  const eventNextSize = isStory ? 64 : 54;
  const eventRoundSize = isStory ? 43 : 37;
  const eventTrackSize = isStory ? 198 : 167;
  const eventDateSize = isStory ? 42 : 36;
  const eventGap = isStory ? 36 : 30;
  const eventRoundY = eventHeadingY + eventNextSize + eventGap;
  const eventTrackY = eventRoundY + eventRoundSize + eventGap;
  const eventDateY = eventTrackY + eventTrackSize + eventGap;
  const roundValue = (project.details.round || '').trim();
  const roundIsPlural =
    /[,/&+]|\b(?:and|to|-)\b/i.test(roundValue) ||
    roundValue.split(/\s+/).filter(Boolean).length > 1;

  return {
    isStory,
    eventBlockX,
    eventIdentityY,
    eventNumberW,
    eventNumberH,
    eventNameSize,
    eventNameX,
    eventNameText: (profile.name || 'DRIVER NAME').toUpperCase(),
    eventTeamW,
    eventTeamX: w - eventBlockX - eventTeamW,
    eventCompetitionY,
    eventHeadingY,
    eventNextSize,
    eventRoundSize,
    eventTrackSize,
    eventDateSize,
    eventRoundY,
    eventTrackY,
    eventDateY,
    roundLabel: roundValue
      ? `${roundIsPlural ? 'ROUNDS' : 'ROUND'} ${roundValue}`
      : 'ROUND',
  };
}

export function getSponsorLayout(
  w: number,
  h: number,
  visibleSponsorCount: number,
  index: number,
  sponsor: Sponsor,
  sponsorLogoScale: number,
) {
  const row = Math.floor(index / 5);
  const rowStart = row * 5;
  const rowCount = Math.min(5, visibleSponsorCount - rowStart);
  const col = index - rowStart;
  const cellW = w / 5;
  const rowWidth = rowCount * cellW;
  const rowX = (w - rowWidth) / 2;
  const rowH = 82;
  const barTop = h - (visibleSponsorCount > 5 ? 164 : 92);
  const cellX = rowX + col * cellW;
  const logoScale = Math.min(1.4, Math.max(0.65, sponsorLogoScale || 1));
  const naturalW = sponsor.logoWidth || 160;
  const naturalH = sponsor.logoHeight || 60;
  const aspect = Math.max(0.15, Math.min(8, naturalW / naturalH));
  const maxW = (cellW - 36) * logoScale;
  const maxH = 66 * logoScale;
  const targetArea = 7600 * logoScale * logoScale;
  let logoW = Math.sqrt(targetArea * aspect);
  let logoH = Math.sqrt(targetArea / aspect);
  const contain = Math.min(1, maxW / logoW, maxH / logoH);
  logoW *= contain;
  logoH *= contain;

  return {
    cellW,
    cellX,
    barTop,
    row,
    rowH,
    logoW,
    logoH,
    logoX: cellX + (cellW - logoW) / 2,
    logoY: barTop + row * rowH + 8 + (66 - logoH) / 2,
  };
}
