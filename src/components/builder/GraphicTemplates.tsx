import type { Branding, DriverProfile, Project } from '../../types';
import { formatEventDate } from '../../utils/format';
import {
  getAnnouncementTemplateLayout,
  getEventTemplateLayout,
  getStandardTemplateLayout,
  getTemplateExtraLayout,
} from './rendererCalculations';

type TemplateSharedProps = {
  project: Project;
  profile: DriverProfile;
  branding: Branding;
  headingFont: string;
  bodyFont: string;
};

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
    isStory,
    eventBlockX,
    eventHeadingY,
    eventNextSize,
    eventRoundSize,
    eventTrackSize,
    eventTrackText,
    eventDateSize,
    eventRoundY,
    eventTrackY,
    eventDateY,
    roundLabel,
  } = getEventTemplateLayout(w, project, profile);

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
        x={eventBlockX}
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
        x={eventBlockX + 4}
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
        x={eventBlockX}
        y={eventTrackY}
        dominantBaseline="hanging"
        fontFamily={headingFont}
        fontSize={eventTrackSize}
        fontWeight="900"
        fill={branding.primary}
        letterSpacing="-3"
        stroke="#080808"
        strokeWidth={isStory ? 3 : 2.5}
        strokeLinejoin="round"
        paintOrder="stroke fill"
      >
        {eventTrackText}
      </text>
      <text
        x={eventBlockX + 4}
        y={eventDateY}
        dominantBaseline="hanging"
        fontFamily={bodyFont}
        fontSize={eventDateSize}
        fontWeight="700"
        letterSpacing="3"
      >
        {formatEventDate(details.date)}
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
}: TemplateSharedProps & { w: number; h: number; title: string; sub: string }) {
  if (project.template === 'announcement') {
    const layout = getAnnouncementTemplateLayout(w, h, project);

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
          x={layout.titleX}
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
          x={layout.textX}
          y={layout.textY}
          dominantBaseline="hanging"
          fontSize={layout.textSize}
          fontWeight="700"
        >
          {layout.lines.map((line, index) => (
            <tspan
              key={`${line}-${index}`}
              x={layout.textX}
              dy={index === 0 ? 0 : layout.textLineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>
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
      {extra.kind === 'bio' && (
        <g fill={branding.accent} fontFamily={bodyFont} fontSize="26">
          {extra.rows.map(row => (
            <text key={row.y} x="74" y={row.y}>
              {row.text}
            </text>
          ))}
        </g>
      )}
      {extra.kind === 'schedule' && (
        <text
          x="74"
          y={extra.y}
          fill={branding.accent}
          fontFamily={bodyFont}
          fontSize="28"
          style={{ whiteSpace: 'pre' }}
        >
          {extra.text}
        </text>
      )}
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
