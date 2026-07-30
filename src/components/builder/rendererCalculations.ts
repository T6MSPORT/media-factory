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
  letterSpacing = 0,
) {
  const characterCount = Math.max(1, text.length);
  const spacingWidth = Math.max(0, characterCount - 1) * letterSpacing;
  const availableGlyphWidth = Math.max(1, maxWidth - spacingWidth);
  const fittedSize = Math.min(
    preferredSize,
    availableGlyphWidth / (characterCount * widthFactor),
  );

  // The minimum is a visual preference, not permission to overflow. If the
  // minimum size cannot fit, continue shrinking so text always stays bounded.
  return fittedSize >= minimumSize ? fittedSize : Math.max(1, fittedSize);
}

export const templateTitles = {
  event: 'RACE WEEKEND',
  announcement: 'ANNOUNCEMENT',
  schedule: 'RACE SCHEDULE',
  results: 'RESULT',
  sponsor: 'PROUDLY SUPPORTED BY',
} satisfies Record<TemplateId, string>;

export function formatRoundLabel(round: string, emptyLabel = '') {
  const value = round.trim();
  if (!value) return emptyLabel;

  const isPlural =
    /[,/&+]|[-–—]|\b(?:and|to)\b/i.test(value) ||
    value.split(/\s+/).filter(Boolean).length > 1;

  return `${isPlural ? 'ROUNDS' : 'ROUND'} ${value}`.toUpperCase();
}

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
    showRaceDetails: true,
    showResult: project.template === 'results',
  };
}

export function getResultsTemplateLayout(
  w: number,
  h: number,
  project: Project,
) {
  const isStory = project.format === 'story';
  const margin = 70;
  const contentWidth = w - margin * 2;
  const session = project.details.resultSession || 'race';
  const raceNumber = ['1', '2', '3'].includes(
    String(project.details.raceNumber),
  )
    ? String(project.details.raceNumber)
    : '1';
  const title =
    session === 'qualifying'
      ? 'QUALIFYING RESULT'
      : `RACE ${raceNumber} RESULT`;
  const titleY = isStory ? 350 : 300;
  const titleSize = fitTextSize(
    title,
    isStory ? 104 : 88,
    contentWidth,
    isStory ? 64 : 54,
    0.7,
    -2,
  );
  const trackText =
    project.details.circuit.trim().toUpperCase() || 'TRACK NAME';
  const trackY = titleY + titleSize + (isStory ? 24 : 18);
  const trackSize = fitTextSize(
    trackText,
    isStory ? 68 : 58,
    contentWidth,
    isStory ? 38 : 34,
    0.6,
    1,
  );
  const roundText =
    session === 'race' ? formatRoundLabel(project.details.round) : '';
  const roundSize = isStory ? 30 : 26;
  const roundY = trackY + trackSize + (isStory ? 18 : 14);
  const numericPosition = Number(
    String(project.details.position).replace(/\D/g, ''),
  );
  const positionNumber = numericPosition > 0
    ? String(numericPosition)
    : '#';
  // Keep qualifying and race positions on the same lower visual centre.
  // Podium wreaths share this anchor so they move with the race position.
  const positionY = h * 0.59;
  const positionSize = isStory ? 520 : 420;
  const podiumPosition =
    (session === 'race' && numericPosition >= 1 && numericPosition <= 3) ||
    (session === 'qualifying' && numericPosition === 1)
      ? numericPosition
      : 0;

  return {
    margin,
    contentWidth,
    session,
    raceNumber,
    title,
    titleY,
    titleSize,
    trackText,
    trackY,
    trackSize,
    roundText,
    roundY,
    roundSize,
    positionNumber,
    positionX: w / 2,
    positionY,
    positionSize,
    positionGap: isStory ? 48 : 40,
    podiumPosition,
    laurelSize: isStory ? 760 : 620,
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

  const textWidthFactor = 0.58;
  const textBackgroundPaddingX = isStory ? 24 : 20;
  const textBackgroundPaddingY = isStory ? 20 : 16;
  const longestLineWidth = Math.min(
    textBoxWidth,
    Math.max(...lines.map(line => line.length * textSize * textWidthFactor)),
  );
  const renderedTextHeight =
    textSize + Math.max(0, lines.length - 1) * textSize * 1.28;

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
    textBackgroundX: textX - textBackgroundPaddingX,
    textBackgroundY: textY - textBackgroundPaddingY,
    textBackgroundWidth:
      longestLineWidth + textBackgroundPaddingX * 2,
    textBackgroundHeight:
      renderedTextHeight + textBackgroundPaddingY * 2,
    lines,
  };
}

export function getScheduleTemplateLayout(
  w: number,
  h: number,
  project: Project,
) {
  const isStory = project.format === 'story';
  const margin = 70;
  const dayCount = Math.min(
    3,
    Math.max(1, project.details.scheduleDayCount || project.details.scheduleDays?.length || 1),
  );
  let raceNumber = 0;
  const days = Array.from({ length: dayCount }, (_, dayIndex) => {
    const suppliedDay = project.details.scheduleDays?.[dayIndex];
    return (
      suppliedDay || {
        day: '' as const,
        sessions: Array.from({ length: 5 }, () => ({
          type: '' as const,
          time: '',
        })),
      }
    );
  }).map(day => ({
    ...day,
    sessions: day.sessions
      .slice(0, 5)
      .filter(session => Boolean(session.type))
      .map(session => ({
        ...session,
        label:
          session.type === 'Race'
            ? `RACE ${++raceNumber}`
            : session.type.toUpperCase(),
      })),
  }));
  const contentWidth = w - margin * 2;
  const titleY = isStory ? 350 : 310;
  const titleSize = isStory ? 112 : 94;
  const trackY = titleY + titleSize + (isStory ? 26 : 20);
  const trackText =
    project.details.circuit.trim().toUpperCase() || 'TRACK NAME';
  const trackSize = fitTextSize(
    trackText,
    isStory ? 58 : 50,
    contentWidth,
    isStory ? 34 : 30,
    0.6,
    1,
  );
  const roundText = formatRoundLabel(project.details.round);
  const roundSize = isStory ? 31 : 26;
  const roundY = trackY + trackSize + (isStory ? 22 : 16);
  const daysY =
    roundY + (roundText ? roundSize + (isStory ? 42 : 32) : isStory ? 24 : 20);
  const dayHeadingSize = dayCount === 3 ? (isStory ? 34 : 26) : isStory ? 40 : 32;
  const dayHeadingHeight = dayHeadingSize + (isStory ? 22 : 18);
  const dayGap = isStory ? 26 : 18;
  const totalRows = days.reduce((count, day) => count + day.sessions.length, 0);
  const availableHeight = h - daysY - (isStory ? 170 : 145);
  const rowHeight = Math.max(
    isStory ? 38 : 31,
    Math.min(
      isStory ? 62 : 52,
      totalRows
        ? (availableHeight - dayCount * dayHeadingHeight - (dayCount - 1) * dayGap) /
            totalRows
        : isStory ? 62 : 52,
    ),
  );
  const sessionSize = Math.min(
    isStory ? 46 : 40,
    Math.max(isStory ? 35 : 31, rowHeight * 0.72),
  );
  const chevronStartX = contentWidth * 0.4;
  const chevronEndX = contentWidth * 0.6;
  const chevronGap = isStory ? 29 : 25;
  let nextDayY = daysY;
  const positionedDays = days.map(day => {
    const positionedDay = {
      ...day,
      x: margin,
      y: nextDayY,
      width: contentWidth,
    };
    nextDayY +=
      dayHeadingHeight + day.sessions.length * rowHeight + dayGap;
    return positionedDay;
  });

  return {
    margin,
    title: 'SCHEDULE',
    titleY,
    titleSize,
    trackY,
    trackText,
    trackSize,
    roundText,
    roundY,
    roundSize,
    contentWidth,
    daysY,
    dayHeadingSize,
    dayHeadingHeight,
    sessionSize,
    chevronStartX,
    chevronEndX,
    chevronGap,
    rowHeight,
    days: positionedDays,
  };
}

export function getTemplateExtraLayout(
  h: number,
  project: Project,
  profile: DriverProfile,
) {
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
  return {
    achievement: '',
    title: project.details.headline || templateTitles[project.template],
    sub:
      project.details.subheadline ||
      profile.team ||
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
  return {
    renderedHeroWidth,
    renderedHeroHeight,
    renderedHeroX,
    renderedHeroY,
    driverTransform: `translate(${project.driverX || 0} ${project.driverY || 0}) translate(${w * 0.66} ${h * 0.46}) scale(${project.driverScale || 1}) translate(${-w * 0.66} ${-h * 0.46})`,
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
  const eventTeamGap = 12;
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
    eventTeamGap -
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
  // SVG textLength makes the final rendered width deterministic, rather than
  // trusting a character-count estimate that changes with the selected font.
  const eventTrackTextLength = Math.min(
    eventTrackMaxWidth,
    eventTrackText.length * eventTrackSize * 0.52,
  );
  const eventDateSize = isStory ? 63 : 54;
  const eventGap = isStory ? 18 : 15;
  const eventRoundY = eventHeadingY + eventNextSize + eventGap;
  const eventTrackY = eventRoundY + eventRoundSize + eventGap;
  const eventDateY = eventTrackY + eventTrackSize + eventGap;
  const roundLabel = formatRoundLabel(project.details.round || '', 'ROUND');

  return {
    isStory,
    eventBlockX,
    eventIdentityRight,
    eventNameY,
    eventIdentityGap,
    eventTeamGap,
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
    eventTrackTextLength,
    eventTrackText,
    eventDateSize,
    eventRoundY,
    eventTrackY,
    eventDateY,
    roundLabel,
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
