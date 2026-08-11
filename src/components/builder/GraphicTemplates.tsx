import type { Branding, DriverProfile, Project, Sponsor } from '../../types';
import { formatEventDateRange } from '../../utils/format';
import podiumWreath from '../../assets/wreath.png';
import {
  fitTextSize,
  formatScheduleDayHeading,
  getAnnouncementTemplateLayout,
  getEventTemplateLayout,
  getResultsTemplateLayout,
  getScheduleTemplateLayout,
  getStandardTemplateLayout,
  getTemplateExtraLayout,
  isStoryLayout,
} from './rendererCalculations';

type TemplateSharedProps = {
  project: Project;
  profile: DriverProfile;
  branding: Branding;
  headingFont: string;
  bodyFont: string;
};

function PodiumWreath({
  x,
  y,
  position,
  size,
  colour: colourOverride,
}: {
  x: number;
  y: number;
  position: number;
  size: number;
  colour?: string;
}) {
  if (!position) return null;

  const colour =
    colourOverride ||
    (position === 1 ? '#d9aa24' : position === 2 ? '#c3c8cf' : '#b8753f');
  const filterId = `podium-wreath-${position}-${colour.replace('#', '')}`;

  return (
    <>
      <defs>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feFlood floodColor={colour} result="colour" />
          <feComposite in="colour" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <image
        data-podium-wreath={position}
        href={podiumWreath}
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
        opacity="1"
      />
    </>
  );
}

function ResultsTemplate({
  w,
  h,
  project,
  profile,
  branding,
  headingFont,
  bodyFont,
}: TemplateSharedProps & { w: number; h: number }) {
  const layout = getResultsTemplateLayout(w, h, project);
  const wreathPalette = { gold: '#d9aa24', silver: '#c3c8cf', bronze: '#b8753f' } as const;
  const wreathChoice = project.details.wreathColour;
  const wreathColour = wreathChoice === 'custom'
    ? project.details.wreathCustomColour || wreathPalette.gold
    : wreathChoice === 'primary'
      ? branding.primary
      : wreathChoice ? wreathPalette[wreathChoice] : undefined;
  const rightAligned = project.textAlignment === 'right';
const mainTextX = rightAligned ? w - layout.margin : layout.margin;
const secondaryTextX = mainTextX + (rightAligned ? -2 : 2);
const mainTextAnchor = rightAligned ? 'end' : 'start';

  return (
    <g fill={branding.accent}>
      <ChampionshipDriverHeader
        w={w}
        project={project}
        profile={profile}
        branding={branding}
        headingFont={headingFont}
        bodyFont={bodyFont}
      />
      <text
        x={mainTextX}
        textAnchor={mainTextAnchor}
        y={layout.titleY}
        dominantBaseline="hanging"
        fontFamily={headingFont}
        fontSize={layout.titleSize}
        fontWeight="900"
        letterSpacing="-3"
        wordSpacing="12"
      >
        {layout.title}
      </text>
      <text
        x={mainTextX}
        textAnchor={mainTextAnchor}
        y={layout.trackY}
        dominantBaseline="hanging"
        fontFamily={headingFont}
        fontSize={layout.trackSize}
        fontWeight="900"
        fill={branding.primary}
        textLength={Math.min(
          layout.contentWidth,
          layout.trackText.length * layout.trackSize * 0.6,
        )}
        lengthAdjust="spacingAndGlyphs"
      >
        {layout.trackText}
      </text>
      {layout.roundText && (
        <text
          x={mainTextX}
          textAnchor={mainTextAnchor}
          y={layout.roundY}
          dominantBaseline="hanging"
          fontFamily={bodyFont}
          fontSize={layout.roundSize}
          fontWeight="700"
          letterSpacing="4"
        >
          {layout.roundText}
        </text>
      )}
      {project.details.wreathVisible !== false && (
        <PodiumWreath
          x={layout.positionX}
          y={layout.positionY}
          position={layout.podiumPosition}
          size={layout.laurelSize}
          colour={wreathColour || (layout.session === 'qualifying' ? '#8b5cf6' : undefined)}
        />
      )}
      <g
        transform={`translate(${layout.positionX} ${layout.positionY}) skewX(-12)`}
        fontFamily={headingFont}
        fontSize={layout.positionSize}
        fontWeight="900"
        fill={branding.accent}
        dominantBaseline="central"
      >
        <text x="0" y="0" textAnchor="middle">
          <tspan>P</tspan>
          <tspan dx={layout.positionGap}>{layout.positionNumber}</tspan>
        </text>
      </g>
    </g>
  );
}

function ChampionshipDriverHeader({
  w,
  project,
  profile,
  branding,
  headingFont,
  bodyFont,
}: TemplateSharedProps & { w: number }) {
  const {
    isStory,
    eventBlockX,
    eventIdentityRight,
    eventNameY,
    eventNumberY,
    eventNumberText,
    eventNumberSize,
    eventNameSize,
    eventNameText,
    eventTeamW,
    eventTeamX,
    eventTeamY,
    eventCompetitionY,
  } = getEventTemplateLayout(w, project, profile);

  return (
    <g fill={branding.accent}>
      <text
        x={eventIdentityRight}
        y={eventNameY}
        textAnchor="end"
        dominantBaseline="hanging"
        fontFamily={headingFont}
        fontSize={eventNameSize}
        fontWeight="900"
        letterSpacing="-1"
      >
        {eventNameText}
      </text>
      <g transform={`translate(${eventIdentityRight} ${eventNumberY})`}>
        <text
          x="0"
          y="0"
          textAnchor="end"
          dominantBaseline="hanging"
          fontFamily={headingFont}
          fontSize={eventNumberSize}
          fontWeight="900"
          fill={branding.primary}
          transform="skewX(-14)"
        >
          {eventNumberText}
        </text>
      </g>
      {profile.teamLogo ? (
        <image
          href={profile.teamLogo}
          x={eventTeamX}
          y={eventTeamY}
          width={eventTeamW}
          height={isStory ? 90 : 78}
          preserveAspectRatio="xMaxYMin meet"
        />
      ) : profile.team ? (
        <text
          x={eventIdentityRight}
          y={eventTeamY + (isStory ? 28 : 24)}
          textAnchor="end"
          fontFamily={bodyFont}
          fontSize={isStory ? 24 : 21}
          fontWeight="700"
          letterSpacing="2"
        >
          {profile.team.toUpperCase()}
        </text>
      ) : null}
      {profile.competitionLogo && (
        <image
          href={profile.competitionLogo}
          x={eventBlockX}
          y={eventCompetitionY}
          width={isStory ? 450 : 378}
          height={isStory ? 234 : 198}
          preserveAspectRatio="xMinYMid meet"
        />
      )}
    </g>
  );
}

export function EventTemplate({
  w,
  project,
  profile,
  branding,
  headingFont,
  bodyFont,
}: TemplateSharedProps & { w: number }) {
  const details = project.details;
  const {
    eventBlockX,
    eventHeadingY,
    eventNextSize,
    eventRoundSize,
    eventTrackSize,
    eventTrackTextLength,
    eventTrackText,
    eventDateSize,
    eventRoundY,
    eventTrackY,
    eventDateY,
    roundLabel,
  } = getEventTemplateLayout(w, project, profile);
const rightAligned = project.textAlignment === 'right';
const mainTextX = rightAligned ? w - eventBlockX : eventBlockX;
const secondaryTextX = mainTextX + (rightAligned ? -4 : 4);
const mainTextAnchor = rightAligned ? 'end' : 'start';
  return (
    <g fill={branding.accent}>
      <ChampionshipDriverHeader
        w={w}
        project={project}
        profile={profile}
        branding={branding}
        headingFont={headingFont}
        bodyFont={bodyFont}
      />
      <text
        x={mainTextX}
        textAnchor={mainTextAnchor}
        y={eventHeadingY}
        dominantBaseline="hanging"
        fontFamily={headingFont}
        fontSize={eventNextSize}
        fontWeight="900"
        letterSpacing="-2"
      >
        NEXT RACE
      </text>
      <text
        x={secondaryTextX}
        textAnchor={mainTextAnchor}
        y={eventRoundY}
        dominantBaseline="hanging"
        fontFamily={bodyFont}
        fontSize={eventRoundSize}
        fontWeight="700"
        letterSpacing="5"
      >
        {roundLabel}
      </text>
      <text
        x={secondaryTextX}
        textAnchor={mainTextAnchor}
        y={eventTrackY}
        dominantBaseline="hanging"
        fontFamily={headingFont}
        fontSize={eventTrackSize}
        textLength={eventTrackTextLength}
        lengthAdjust="spacingAndGlyphs"
        fontWeight="900"
        fill={branding.primary}
        letterSpacing="-3"
      >
        {eventTrackText}
      </text>
      <text
        x={secondaryTextX}
        textAnchor={mainTextAnchor}
        y={eventDateY}
        dominantBaseline="hanging"
        fontFamily={bodyFont}
        fontSize={eventDateSize}
        fontWeight="700"
        letterSpacing="3"
      >
        {formatEventDateRange(details.date, details.dateEnd)}
      </text>
    </g>
  );
}

export function StandardTemplate({
  w,
  h,
  project,
  profile,
  branding,
  title,
  sub,
  headingFont,
  bodyFont,
  featuredSponsor,
}: TemplateSharedProps & {
  w: number;
  h: number;
  title: string;
  sub: string;
  featuredSponsor?: Sponsor;
}) {
  if (project.template === 'sponsor') {
    const isStory = isStoryLayout(project);
    const isCompact = h / w <= 1.05;
    const margin = 70;
    const sponsorTitle = 'PROUDLY SUPPORTED BY';
    const titleSize = fitTextSize(
      sponsorTitle,
      isStory ? 88 : 74,
      w - margin * 2,
      isStory ? 62 : 54,
      0.62,
      -3,
    );
    const titleY = isCompact ? 235 : isStory ? 350 : 300;
    const logoScale = Math.min(2, Math.max(0.25, project.details.sponsorLogoScale ?? 1));
    const baseLogoWidth = w - margin * 2;
    const baseLogoHeight = isCompact ? 260 : isStory ? 520 : 390;
    const logoWidth = baseLogoWidth * logoScale;
    const logoHeight = baseLogoHeight * logoScale;
    const logoX = (w - logoWidth) / 2;
    const logoY =
      titleY + titleSize + (isCompact ? 45 : isStory ? 90 : 70) +
      (project.details.sponsorLogoY ?? 0);
    const productImages = (project.details.productImages || []).filter(Boolean).slice(0, 3);
    const productGap = 28;
    const productAreaWidth = w - margin * 2;
    const productCellWidth = productImages.length
      ? (productAreaWidth - productGap * (productImages.length - 1)) / productImages.length
      : 0;
    const productHeight = Math.min(
      productCellWidth * 1.18,
      isCompact ? 270 : isStory ? 470 : 330,
    );
    const productY = h - productHeight - (isCompact ? 155 : 170);

    return (
      <g fill={branding.accent}>
        <ChampionshipDriverHeader
          w={w}
          project={project}
          profile={profile}
          branding={branding}
          headingFont={headingFont}
          bodyFont={bodyFont}
        />
        <text
          x={w / 2}
          y={titleY}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontFamily={headingFont}
          fontSize={titleSize}
          fontWeight="900"
          letterSpacing="-3"
        >
          {sponsorTitle}
        </text>
        {featuredSponsor?.logo ? (
          <image
            data-featured-sponsor={featuredSponsor.id}
            href={featuredSponsor.logo}
            x={logoX}
            y={logoY}
            width={logoWidth}
            height={logoHeight}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <text
            data-featured-sponsor={featuredSponsor?.id || 'placeholder'}
            x={w / 2}
            y={logoY + logoHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={headingFont}
            fontSize={isStory ? 112 : 92}
            fontWeight="900"
            fill={branding.primary}
            textLength={Math.min(
              logoWidth,
              (featuredSponsor?.name || 'SPONSOR LOGO').length *
                (isStory ? 112 : 92) *
                0.58,
            )}
            lengthAdjust="spacingAndGlyphs"
          >
            {(featuredSponsor?.name || 'SPONSOR LOGO').toUpperCase()}
          </text>
        )}
        {productImages.map((image, index) => (
          <image
            key={`${index}-${image.slice(-16)}`}
            data-product-placement={index + 1}
            href={image}
            x={margin + index * (productCellWidth + productGap)}
            y={productY}
            width={productCellWidth}
            height={productHeight}
            preserveAspectRatio="xMidYMax meet"
          />
        ))}
      </g>
    );
  }

  if (project.template === 'announcement') {
    const layout = getAnnouncementTemplateLayout(w, h, project);
const rightAligned = project.textAlignment === 'right';
const isOrbitron = headingFont.toLowerCase().includes('orbitron');
const titleX = rightAligned ? w - layout.titleX : layout.titleX;
const announcementTitleSize = isOrbitron
  ? layout.titleSize * 0.88
  : layout.titleSize;
const textX = rightAligned ? w - layout.textX : layout.textX;
const textAnchor = rightAligned ? 'end' : 'start';
    return (
      <g fontFamily={bodyFont} fill={branding.accent}>
        <ChampionshipDriverHeader
          w={w}
          project={project}
          profile={profile}
          branding={branding}
          headingFont={headingFont}
          bodyFont={bodyFont}
        />
        <text
          x={titleX}
          textAnchor={textAnchor}
          y={layout.titleY}
          dominantBaseline="hanging"
          fontFamily={headingFont}
          fontSize={announcementTitleSize}
          fontWeight="900"
          letterSpacing="-3"
        >
          {layout.title}
        </text>
        <text
          x={textX}
          textAnchor={textAnchor}
          y={layout.textY}
          dominantBaseline="hanging"
          fontSize={layout.textSize}
          fontWeight="700"
          fill={branding.primary}
        >
          {layout.lines.map((line, index) => (
            <tspan
              key={`${line}-${index}`}
              x={textX}
              dy={index === 0 ? 0 : layout.textLineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  }

  if (project.template === 'schedule') {
    const layout = getScheduleTemplateLayout(w, h, project);
    const rightAligned = project.textAlignment === 'right';
const mainTextX = rightAligned ? w - layout.margin : layout.margin;
const secondaryTextX = mainTextX + (rightAligned ? -2 : 2);
const mainTextAnchor = rightAligned ? 'end' : 'start';

    return (
      <g fontFamily={bodyFont} fill={branding.accent}>
        <ChampionshipDriverHeader
          w={w}
          project={project}
          profile={profile}
          branding={branding}
          headingFont={headingFont}
          bodyFont={bodyFont}
        />
        <text
          x={mainTextX}
          textAnchor={mainTextAnchor}
          y={layout.titleY}
          dominantBaseline="hanging"
          fontFamily={headingFont}
          fontSize={layout.titleSize}
          fontWeight="900"
          letterSpacing="-3"
        >
          {layout.title}
        </text>
        <text
          x={mainTextX}
          textAnchor={mainTextAnchor}
          y={layout.trackY}
          dominantBaseline="hanging"
          fontFamily={headingFont}
          fontSize={layout.trackSize}
          fontWeight="900"
          fill={branding.primary}
          textLength={Math.min(
            layout.contentWidth,
            layout.trackText.length * layout.trackSize * 0.6,
          )}
          lengthAdjust="spacingAndGlyphs"
        >
          {layout.trackText}
        </text>
        {layout.roundText && (
          <text
            x={secondaryTextX}
            textAnchor={mainTextAnchor}
            y={layout.roundY}
            dominantBaseline="hanging"
            fontFamily={bodyFont}
            fontSize={layout.roundSize}
            fontWeight="700"
            letterSpacing="4"
          >
            {layout.roundText}
          </text>
        )}
        {layout.days.map(day => (
          <g key={`${day.day}-${day.y}`} transform={`translate(${day.x} ${day.y})`}>
            <rect
              width={day.width}
              height={layout.dayHeadingHeight}
              fill={branding.primary}
              opacity=".92"
            />
            <text
              x={day.width / 2}
              y={layout.dayHeadingHeight / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={headingFont}
              fontSize={layout.dayHeadingSize}
              fontWeight="900"
>
  {formatScheduleDayHeading(day.day, day.date)}
            </text>
            {day.sessions.map((session, sessionIndex) => {
              const rowTop =
                layout.dayHeadingHeight + layout.headerPadding + sessionIndex * layout.rowHeight;
              const y = rowTop + layout.rowHeight / 2;
              return (
                <g key={sessionIndex}>
                  {sessionIndex > 0 && <line
                    x1="0"
                    x2={day.width}
                    y1={rowTop}
                    y2={rowTop}
                    stroke={branding.accent}
                    strokeOpacity=".22"
                  />}
                  <text
                    x="4"
                    y={y}
                    dominantBaseline="middle"
                    fontSize={layout.sessionSize}
                    fontWeight="700"
                  >
                    {session.label}
                  </text>
                  <g
                    fill="none"
                    stroke={branding.primary}
                    strokeWidth="4"
                    strokeOpacity=".72"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    {Array.from({
                      length: Math.max(
                        1,
                        Math.floor(
                          (layout.chevronEndX - layout.chevronStartX) /
                            layout.chevronGap,
                        ),
                      ),
                    }).map((_, chevronIndex) => {
                      const chevronX =
                        layout.chevronStartX +
                        chevronIndex * layout.chevronGap;
                      const chevronHalfHeight = Math.max(
                        6,
                        layout.sessionSize * 0.17,
                      );
                      const chevronWidth = Math.max(
                        8,
                        layout.sessionSize * 0.2,
                      );
                      return (
                        <path
                          key={chevronIndex}
                          d={`M ${chevronX} ${y - chevronHalfHeight} L ${
                            chevronX + chevronWidth
                          } ${y} L ${chevronX} ${y + chevronHalfHeight}`}
                        />
                      );
                    })}
                  </g>
                  <text
                    x={day.width - 4}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={layout.sessionSize}
                    fontWeight="900"
                  >
                    {session.time}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </g>
    );
  }

  if (project.template === 'results') {
    return (
      <ResultsTemplate
        w={w}
        h={h}
        project={project}
        profile={profile}
        branding={branding}
        headingFont={headingFont}
        bodyFont={bodyFont}
      />
    );
  }

  const details = project.details;
  const {
    titleY,
    titleSize,
    subY,
    detailY,
    dateY,
    resultY,
    showRaceDetails,
    showResult,
  } = getStandardTemplateLayout(h, project);

  return (
    <g fontFamily={bodyFont} fill={branding.accent}>
      <ChampionshipDriverHeader
        w={w}
        project={project}
        profile={profile}
        branding={branding}
        headingFont={headingFont}
        bodyFont={bodyFont}
      />
      <text
        x="70"
        y={titleY}
        fontFamily={headingFont}
        fontSize={titleSize}
        fontWeight="900"
        letterSpacing="-2"
      >
        {String(title).toUpperCase()}
      </text>
      <text x="74" y={subY} fontSize="28" letterSpacing="4" opacity=".88">
        {String(sub).toUpperCase()}
      </text>
      {showRaceDetails && (
        <>
          <text x="74" y={detailY} fontSize="27" fontWeight="700">
            {details.round}
            {details.round && details.circuit ? ' · ' : ''}
            {details.circuit}
          </text>
          <text x="74" y={dateY} fontSize="24">
            {details.date} {details.time}
          </text>
        </>
      )}
      {showResult && (
        <text x="74" y={resultY} fontSize="34" fontWeight="900">
          {details.position} {details.result}
        </text>
      )}
    </g>
  );
}

export function AchievementBadge({
  w,
  h,
  achievement,
  branding,
  headingFont,
  bodyFont,
}: {
  w: number;
  h: number;
  achievement: string;
  branding: Branding;
  headingFont: string;
  bodyFont: string;
}) {
  if (!achievement) return null;

  return (
    <g transform={`translate(${w - 350} ${h * 0.61})`}>
      <path d="M0 0 H280 L250 88 H0 Z" fill={branding.primary} />
      <path d="M0 0 H280" stroke={branding.accent} strokeWidth="5" />
      <text
        x="22"
        y="38"
        fill={branding.accent}
        fontFamily={headingFont}
        fontSize="27"
        fontWeight="900"
      >
        {achievement}
      </text>
      <text
        x="22"
        y="70"
        fill={branding.accent}
        fontFamily={bodyFont}
        fontSize="18"
      >
        ACHIEVEMENT
      </text>
    </g>
  );
}

export function TemplateExtras({
  h,
  project,
  profile,
  branding,
  headingFont,
  bodyFont,
}: TemplateSharedProps & { h: number }) {
  const extra = getTemplateExtraLayout(h, project, profile);

  return (
    <>
      {extra.kind === 'sponsor' && (
        <text
          x="74"
          y={extra.y}
          fill={branding.accent}
          fontFamily={headingFont}
          fontSize="45"
        >
          {extra.text}
        </text>
      )}
    </>
  );
}
