import type { Branding, DriverProfile, Project } from '../../types';
import { formatEventDate } from '../../utils/format';

type TemplateSharedProps = {
  project: Project;
  profile: DriverProfile;
  branding: Branding;
  headingFont: string;
  bodyFont: string;
};

export function EventTemplate({
  w,
  project,
  profile,
  branding,
  headingFont,
  bodyFont,
}: TemplateSharedProps & { w: number }) {
  const details = project.details;
  const isStory = project.format === 'story';
  const eventTop = isStory ? 70 : 58;
  const eventBlockX = 70;
  const eventIdentityY = eventTop + (isStory ? 46 : 40);
  const eventNumberW = isStory ? 138 : 122;
  const eventNumberH = isStory ? 58 : 52;
  const eventNameSize = isStory ? 46 : 40;
  const eventNameX = eventBlockX + eventNumberW + 22;
  const eventNameText = (profile.name || 'DRIVER NAME').toUpperCase();
  const eventTeamW = isStory ? 260 : 220;
  const eventTeamX = w - eventBlockX - eventTeamW;
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
  const roundValue = (details.round || '').trim();
  const roundIsPlural =
    /[,/&+]|\b(?:and|to|-)\b/i.test(roundValue) ||
    roundValue.split(/\s+/).filter(Boolean).length > 1;
  const roundLabel = roundValue
    ? `${roundIsPlural ? 'ROUNDS' : 'ROUND'} ${roundValue}`
    : 'ROUND';

  return (
    <g fill={branding.accent}>
      <g textAnchor="start">
        <g
          transform={`translate(${eventBlockX} ${eventIdentityY - eventNumberH / 2}) skewX(-10)`}
        >
          <rect
            width={eventNumberW}
            height={eventNumberH}
            rx="5"
            fill={branding.primary}
          />
          <rect
            x="5"
            y="5"
            width={eventNumberW - 10}
            height={eventNumberH - 10}
            rx="3"
            fill="none"
            stroke={branding.accent}
            strokeWidth="2"
            opacity=".75"
          />
          <text
            x={isStory ? 15 : 13}
            y={isStory ? 43 : 39}
            fontFamily={headingFont}
            fontSize={isStory ? 39 : 35}
            fontWeight="900"
            fill={branding.accent}
            transform="skewX(10)"
          >
            #{profile.number || '00'}
          </text>
        </g>
        <text
          x={eventNameX}
          y={eventIdentityY + eventNameSize * 0.34}
          fontFamily={headingFont}
          fontSize={eventNameSize}
          fontWeight="900"
          letterSpacing="-1"
        >
          {eventNameText}
        </text>
        {profile.teamLogo ? (
          <image
            href={profile.teamLogo}
            x={eventTeamX}
            y={eventIdentityY - (isStory ? 45 : 39)}
            width={eventTeamW}
            height={isStory ? 90 : 78}
            preserveAspectRatio="xMaxYMid meet"
          />
        ) : profile.team ? (
          <text
            x={w - eventBlockX}
            y={eventIdentityY + (isStory ? 10 : 8)}
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
            width={isStory ? 300 : 250}
            height={isStory ? 180 : 150}
            preserveAspectRatio="xMinYMid meet"
          />
        )}
      </g>
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
      >
        {(details.circuit || 'TRACK NAME').toUpperCase()}
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
  h,
  project,
  profile,
  branding,
  title,
  sub,
  headingFont,
  bodyFont,
}: TemplateSharedProps & { h: number; title: string; sub: string }) {
  const details = project.details;

  return (
    <g fontFamily={bodyFont} fill={branding.accent}>
      <text x="70" y="95" fontSize="28" fontWeight="700" letterSpacing="5">
        #{profile.number}
      </text>
      <text
        x="70"
        y="145"
        fontFamily={headingFont}
        fontSize="46"
        fontWeight="900"
      >
        {profile.name.toUpperCase()}
      </text>
      <text
        x="70"
        y={h * 0.57}
        fontFamily={headingFont}
        fontSize={project.format === 'story' ? 82 : 68}
        fontWeight="900"
        letterSpacing="-2"
      >
        {String(title).toUpperCase()}
      </text>
      <text x="74" y={h * 0.57 + 55} fontSize="28" letterSpacing="4" opacity=".88">
        {String(sub).toUpperCase()}
      </text>
      {project.template !== 'bio' && (
        <>
          <text x="74" y={h * 0.57 + 130} fontSize="27" fontWeight="700">
            {details.round}
            {details.round && details.circuit ? ' · ' : ''}
            {details.circuit}
          </text>
          <text x="74" y={h * 0.57 + 174} fontSize="24">
            {details.date} {details.time}
          </text>
        </>
      )}
      {['qualifying', 'results'].includes(project.template) && (
        <text x="74" y={h * 0.57 + 230} fontSize="34" fontWeight="900">
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
  const details = project.details;

  return (
    <>
      {project.template === 'bio' && (
        <g fill={branding.accent} fontFamily={bodyFont} fontSize="26">
          <text x="74" y={h * 0.8}>
            {'TEAM  '}
            {profile.team || '—'}
          </text>
          <text x="74" y={h * 0.8 + 42}>
            {'LOCATION  '}
            {profile.location || '—'}
          </text>
          <text x="74" y={h * 0.8 + 84}>
            {'AGE  '}
            {profile.age || '—'}
          </text>
          <text x="74" y={h * 0.8 + 126}>
            {'CAR  '}
            {profile.car || '—'}
          </text>
        </g>
      )}
      {project.template === 'schedule' && (
        <text
          x="74"
          y={h * 0.75}
          fill={branding.accent}
          fontFamily={bodyFont}
          fontSize="28"
          style={{ whiteSpace: 'pre' }}
        >
          {details.scheduleLines || 'ADD SESSION TIMES'}
        </text>
      )}
      {project.template === 'sponsor' && (
        <text
          x="74"
          y={h * 0.74}
          fill={branding.accent}
          fontFamily={headingFont}
          fontSize="45"
        >
          {details.sponsorName.toUpperCase() || 'SPONSOR NAME'}
        </text>
      )}
    </>
  );
}
