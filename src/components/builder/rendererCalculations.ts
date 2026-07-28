import type {
  Branding,
  DriverProfile,
  Project,
  Sponsor,
  TemplateId,
} from '../../types';

type Size = { width: number; height: number };

export function fitTextSize(
  text: string,
  preferredSize: number,
  maxWidth: number,
  minimumSize: number,
  widthFactor = 0.62,
) {
  const estimatedWidth = Math.max(1, text.length) * preferredSize * widthFactor;
  return Math.max(
    minimumSize,
    Math.min(preferredSize, preferredSize * (maxWidth / estimatedWidth)),
  );
}

export const templateTitles = {
  event: 'RACE WEEKEND',
  announcement: 'ANNOUNCEMENT',
  bio: 'DRIVER PROFILE',
  schedule: 'RACE SCHEDULE',
  qualifying: 'QUALIFYING RESULT',
  results: 'RACE RESULT',
  sponsor: 'PROUDLY SUPPORTED BY',
} satisfies Record<TemplateId, string>;

export function getStandardTemplateLayout(
  h: number,
  project: Pick<Project, 'format' | 'template'>,
) {
  const titleY = h * 0.57;

  return {
    titleY,
    titleSize: project.format === 'story' ? 82 : 68,
    subY: titleY + 55,
    detailY: titleY + 130,
    dateY: titleY + 174,
    resultY: titleY + 230,
    showRaceDetails: project.template !== 'bio',
    showResult:
      project.template === 'qualifying' || project.template === 'results',
  };
}

function wrapTextToWidth(
  text: string,
  fontSize: number,
  maxWidth: number,
  widthFactor = 0.58,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length * fontSize * widthFactor <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export function getAnnouncementTemplateLayout(
  w: number,
  h: number,
  project: Project,
) {
  const isStory = project.format === 'story';
  const margin = 70;
  const title = templateTitles.announcement;
  const titleMaxWidth = w - margin * 2;
  const titleSize = fitTextSize(
    title,
    isStory ? 122 : 104,
    titleMaxWidth,
    isStory ? 82 : 70,
    0.59,
  );
  const titleY = isStory ? 350 : 310;
  const textX = margin;
  const textY = titleY + titleSize + (isStory ? 46 : 38);
  const textBoxWidth = w - margin * 2;
  const textBoxHeight = isStory ? 520 : 340;
  const copy =
    project.details.subheadline.trim().toUpperCase() ||
    'ENTER THE ANNOUNCEMENT TEXT';
  const preferredTextSize = isStory ? 64 : 54;
  const minimumTextSize = isStory ? 28 : 24;
  let textSize = preferredTextSize;
  let lines = wrapTextToWidth(copy, textSize, textBoxWidth);

  while (
    textSize > minimumTextSize &&
    lines.length * textSize * 1.28 > textBoxHeight
  ) {
    textSize -= 1;
    lines = wrapTextToWidth(copy, textSize, textBoxWidth);
  }

  return {
    title,
    titleX: margin,
    titleY,
    titleSize,
    titleMaxWidth,
    textX,
    textY,
    textSize,
    textBoxWidth,
    textBoxHeight,
    textLineHeight: textSize * 1.28,
    lines,
  };
}

export function getTemplateExtraLayout(
  h: number,
  project: Project,
  profile: DriverProfile,
) {
  if (project.template === 'bio') {
    return {
      kind: 'bio' as const,
      rows: [
        { y: h * 0.8, text: `TEAM  ${profile.team || '—'}` },
        { y: h * 0.8 + 42, text: `LOCATION  ${profile.location || '—'}` },
        { y: h * 0.8 + 84, text: `AGE  ${profile.age || '—'}` },
        { y: h * 0.8 + 126, text: `CAR  ${profile.car || '—'}` },
      ],
    };
  }

  if (project.template === 'schedule') {
    return {
      kind: 'schedule' as const,
      y: h * 0.75,
      text: project.details.scheduleLines || 'ADD SESSION TIMES',
    };
  }

  if (project.template === 'sponsor') {
    return {
      kind: 'sponsor' as const,
      y: h * 0.74,
      text: project.details.sponsorName.toUpperCase() || 'SPONSOR NAME',
    };
  }

  return { kind: 'none' as const };
}

export function getBrandLogoLayout(w: number, template: TemplateId) {
  if (template === 'event') return null;

  return {
    competitionX: w - 370,
    teamX: w - 195,
    y: 35,
    width: 150,
    height: 150,
  };
}

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
  const eventIdentityRight = w - eventBlockX;
  const eventNameY = eventTop;
  const eventNumberW = isStory ? 330 : 280;
  const eventNumberH = isStory ? 88 : 76;
  const eventIdentityGap = 4;
  const eventNameSize = isStory ? 46 : 40;
  // Microgramma's visible capitals occupy less height than the CSS font-size.
  // Use the rendered line height here so the Next Race identity rows have
  // genuinely tight, equal optical gaps rather than large invisible ones.
  const eventIdentityLineHeightFactor = 0.76;
  const eventNumberY =
    eventNameY +
    eventNameSize * eventIdentityLineHeightFactor +
    eventIdentityGap;
  const eventNumberText = `#${profile.number || '00'}`;
  const eventNumberSize = fitTextSize(
    eventNumberText,
    isStory ? 84 : 72,
    eventNumberW,
    isStory ? 58 : 50,
    0.86,
  );
  const eventTeamW = isStory ? 260 : 220;
  // Keep the logo's image box clear of the slanted number. Pulling the box
  // upward to compensate for transparent PNG padding can make the artwork
  // overlap the number, so any optical adjustment must happen inside the
  // asset rather than by collapsing these row bounds.
  const eventTeamOpticalOffset = 0;
  const eventTeamY =
    eventNumberY +
    eventNumberSize * eventIdentityLineHeightFactor +
    eventIdentityGap -
    eventTeamOpticalOffset;
  const eventCompetitionY = isStory ? 34 : 28;
  const eventHeadingY = isStory ? 540 : 430;
  const eventNextSize = isStory ? 96 : 81;
  const eventRoundSize = isStory ? 65 : 56;
  const eventTrackText = (project.details.circuit || 'TRACK NAME').toUpperCase();
  const eventTrackMaxWidth = w - eventBlockX * 2;
  const eventTrackSize = fitTextSize(
    eventTrackText,
    isStory ? 198 : 167,
    eventTrackMaxWidth,
    isStory ? 54 : 46,
    0.52,
  );
  const eventDateSize = isStory ? 63 : 54;
  const eventGap = isStory ? 18 : 15;
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
    eventIdentityRight,
    eventNameY,
    eventIdentityGap,
    eventIdentityLineHeightFactor,
    eventNumberW,
    eventNumberH,
    eventNumberY,
    eventNumberText,
    eventNumberSize,
    eventNameSize,
    eventNameText: (profile.name || 'DRIVER NAME').toUpperCase(),
    eventTeamW,
    eventTeamOpticalOffset,
    eventTeamX: w - eventBlockX - eventTeamW,
    eventTeamY,
    eventCompetitionY,
    eventHeadingY,
    eventNextSize,
    eventRoundSize,
    eventTrackMaxWidth,
    eventTrackSize,
    eventTrackText,
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

export function getSponsorLayouts(
  w: number,
  h: number,
  sponsors: Sponsor[],
  sponsorLogoScale: number,
) {
  const visibleSponsors = sponsors.slice(0, 10);
  const layouts = visibleSponsors.map((sponsor, index) =>
    getSponsorLayout(
      w,
      h,
      visibleSponsors.length,
      index,
      sponsor,
      sponsorLogoScale,
    ),
  );

  for (let row = 0; row < 2; row += 1) {
    const rowStart = row * 5;
    const rowLayouts = layouts.slice(rowStart, rowStart + 5);
    const rowSponsors = visibleSponsors.slice(rowStart, rowStart + 5);
    if (!rowLayouts.length) continue;

    const logoScale = Math.min(
      1.4,
      Math.max(0.65, sponsorLogoScale || 1),
    );
    const minimumGap = 36;
    const maximumGap = 40;
    const availableWidth = w - 72;
    const rectangularIndexes = rowSponsors
      .map((sponsor, index) => {
        const naturalW = sponsor.logoWidth || 160;
        const naturalH = sponsor.logoHeight || 60;
        return naturalW / naturalH >= 1.5 ? index : -1;
      })
      .filter(index => index >= 0);

    if (rectangularIndexes.length) {
      const rectangularAspectTotal = rectangularIndexes.reduce(
        (total, index) => {
          const sponsor = rowSponsors[index];
          return total + (sponsor.logoWidth || 160) / (sponsor.logoHeight || 60);
        },
        0,
      );
      const fixedLogoWidth = rowLayouts.reduce(
        (total, layout, index) =>
          rectangularIndexes.includes(index) ? total : total + layout.logoW,
        0,
      );
      // Reserve the preferred visible spacing before sizing wide logos.
      // Otherwise the logos expand first and absorb any increase to the gap cap.
      const gapWidth = maximumGap * Math.max(0, rowLayouts.length - 1);
      const sharedRectangularHeight = Math.min(
        52 * logoScale,
        (availableWidth - fixedLogoWidth - gapWidth) /
          rectangularAspectTotal,
      );

      rectangularIndexes.forEach(index => {
        const sponsor = rowSponsors[index];
        const aspect =
          (sponsor.logoWidth || 160) / (sponsor.logoHeight || 60);
        rowLayouts[index].logoH = sharedRectangularHeight;
        rowLayouts[index].logoW = sharedRectangularHeight * aspect;
        rowLayouts[index].logoY =
          rowLayouts[index].barTop +
          rowLayouts[index].row * rowLayouts[index].rowH +
          8 +
          (66 - sharedRectangularHeight) / 2;
      });
    }

    const totalLogoWidth = rowLayouts.reduce(
      (total, layout) => total + layout.logoW,
      0,
    );
    const gap =
      rowLayouts.length === 1
        ? 0
        : Math.max(
            minimumGap,
            Math.min(
              maximumGap,
              (availableWidth - totalLogoWidth) / (rowLayouts.length - 1),
            ),
          );
    const rowWidth =
      totalLogoWidth + gap * Math.max(0, rowLayouts.length - 1);
    let logoX = (w - rowWidth) / 2;

    rowLayouts.forEach((layout) => {
      layout.cellX = logoX;
      layout.cellW = layout.logoW;
      layout.logoX = logoX;
      logoX += layout.logoW + gap;
    });
  }

  return layouts;
}
