import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Branding, DriverProfile, Project, Sponsor } from '../../types';
import {
  getBackgroundLayout,
  getBrandLogoLayout,
  getSponsorLayouts,
} from './rendererCalculations';

type Size = { width: number; height: number };

export function BackgroundLayers({
  w,
  h,
  project,
  branding,
  loadedHeroSize,
  driverImage,
}: {
  w: number;
  h: number;
  project: Project;
  branding: Branding;
  loadedHeroSize: Size | null;
  driverImage?: string;
}) {
  const {
    renderedHeroWidth,
    renderedHeroHeight,
    renderedHeroX,
    renderedHeroY,
    driverTransform,
    stripeLeftTop,
    stripeRightTop,
    stripeRightBottom,
    stripeLeftBottom,
    stripeLineLeft,
    stripeLineRight,
  } = getBackgroundLayout(w, h, project, loadedHeroSize);

  return (
    <>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={branding.secondary} />
          <stop offset="1" stopColor="#050607" />
        </linearGradient>
        <linearGradient id="driverFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.78" stopColor="white" />
          <stop offset="0.94" stopColor="black" />
        </linearGradient>
        <mask id="driverMask">
          <rect width={w} height={h} fill="url(#driverFade)" />
        </mask>
        <clipPath id="driverZone">
          <rect x={w * 0.3} y={h * 0.05} width={w * 0.7} height={h * 0.82} />
        </clipPath>
        <linearGradient id="bgOverlay" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={branding.secondary} stopOpacity=".18" />
          <stop offset="1" stopColor="#050607" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="0.58" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".94" />
        </linearGradient>
        <linearGradient id="eventTopFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity=".88" />
          <stop offset="0.44" stopColor="#000000" stopOpacity=".62" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#bg)" />
      {project.heroImage && loadedHeroSize && (
        <>
          <image
            href={project.heroImage}
            x={renderedHeroX}
            y={renderedHeroY}
            width={renderedHeroWidth}
            height={renderedHeroHeight}
            preserveAspectRatio="none"
          />
          <rect width={w} height={h} fill="url(#bgOverlay)" />
        </>
      )}
      {project.template === 'event' && (
        <rect
          width={w}
          height={h * (project.format === 'story' ? 0.38 : 0.36)}
          fill="url(#eventTopFade)"
          pointerEvents="none"
        />
      )}
      <path
        d={`M0 ${stripeLeftTop} L${w} ${stripeRightTop} L${w} ${stripeRightBottom} L0 ${stripeLeftBottom}Z`}
        fill={branding.primary}
        opacity=".9"
      />
      <path
        d={`M0 ${stripeLineLeft} L${w} ${stripeLineRight}`}
        stroke={branding.accent}
        strokeWidth="5"
        opacity=".8"
      />
      {driverImage && project.driverVisible !== false && (
        <g transform={driverTransform}>
          <image
            href={driverImage}
            x={w * 0.3}
            y={h * 0.05}
            width={w * 0.72}
            height={h * 0.82}
            preserveAspectRatio="xMidYMax meet"
            clipPath="url(#driverZone)"
            mask="url(#driverMask)"
          />
        </g>
      )}
      <rect width={w} height={h} fill="url(#bottomFade)" pointerEvents="none" />
    </>
  );
}

export function SponsorBar({
  w,
  h,
  sponsors,
  branding,
  bodyFont,
}: {
  w: number;
  h: number;
  sponsors: Sponsor[];
  branding: Branding;
  bodyFont: string;
}) {
  const visibleSponsors = sponsors.slice(0, 10);
  const sponsorLayouts = getSponsorLayouts(
    w,
    h,
    visibleSponsors,
    branding.sponsorLogoScale,
  );

  return (
    <g>
      {sponsors.length ? (
        visibleSponsors.map((sponsor, index) => {
          const {
            cellW,
            cellX,
            barTop,
            row,
            rowH,
            logoW,
            logoH,
            logoX,
            logoY,
          } = sponsorLayouts[index];

          return sponsor.logo ? (
            <image
              key={sponsor.id}
              href={sponsor.logo}
              x={logoX}
              y={logoY}
              width={logoW}
              height={logoH}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <text
              key={sponsor.id}
              x={cellX + cellW / 2}
              y={barTop + row * rowH + 48}
              textAnchor="middle"
              fontSize="17"
              fill={branding.accent}
            >
              {sponsor.name}
            </text>
          );
        })
      ) : (
        <text
          x={w / 2}
          y={h - 48}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontSize="20"
          fill={branding.accent}
          opacity=".7"
          letterSpacing="4"
        >
          SPONSOR BAR
        </text>
      )}
    </g>
  );
}

export function DragSurface({
  w,
  h,
  backgroundHero,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  w: number;
  h: number;
  backgroundHero?: string;
  onPointerDown?: (event: ReactPointerEvent<SVGRectElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<SVGRectElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<SVGRectElement>) => void;
}) {
  if (!backgroundHero || !onPointerDown) return null;

  return (
    <rect
      width={w}
      height={h}
      fill="transparent"
      style={{ cursor: 'grab', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}

export function BrandLogos({
  w,
  project,
  profile,
}: {
  w: number;
  project: Project;
  profile: DriverProfile;
}) {
  const layout = getBrandLogoLayout(w, project.template);
  if (!layout) return null;

  return (
    <>
      {profile.competitionLogo && (
        <image
          href={profile.competitionLogo}
          x={layout.competitionX}
          y={layout.y}
          width={layout.width}
          height={layout.height}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      {profile.teamLogo && (
        <image
          href={profile.teamLogo}
          x={layout.teamX}
          y={layout.y}
          width={layout.width}
          height={layout.height}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </>
  );
}
