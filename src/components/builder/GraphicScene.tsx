import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Data, Project, Sponsor } from '../../types';
import {
  BackgroundLayers,
  DragSurface,
  SponsorBar,
} from './GraphicLayers';
import {
  AchievementBadge,
  EventTemplate,
  StandardTemplate,
  TemplateExtras,
} from './GraphicTemplates';
import { GraphicElementLayer } from './GraphicElements';
import { getGraphicCopy } from './rendererCalculations';
import type { HeroDimensions } from './useHeroDimensions';

type GraphicSceneProps = {
  w: number;
  h: number;
  project: Project;
  data: Data;
  sponsors: Sponsor[];
  loadedHeroSize: HeroDimensions | null;
  onBackgroundPointerDown?: (event: ReactPointerEvent<SVGRectElement>) => void;
  onBackgroundPointerMove?: (event: ReactPointerEvent<SVGRectElement>) => void;
  onBackgroundPointerUp?: (event: ReactPointerEvent<SVGRectElement>) => void;
};

export function GraphicScene({
  w,
  h,
  project,
  data,
  sponsors,
  loadedHeroSize,
  onBackgroundPointerDown,
  onBackgroundPointerMove,
  onBackgroundPointerUp,
}: GraphicSceneProps) {
  const profile = data.profile;
  const branding = data.branding;
  const copy = getGraphicCopy(project, profile, branding);
  const templateProps = {
    project,
    profile,
    branding,
    headingFont: copy.headingFont,
    bodyFont: copy.bodyFont,
  };

  return (
    <>
      <BackgroundLayers
        w={w}
        h={h}
        project={project}
        branding={branding}
        loadedHeroSize={loadedHeroSize}
        driverImage={profile.driverImage}
      />
      <GraphicElementLayer
        w={w}
        h={h}
        project={project}
        branding={branding}
      />
      {project.template === 'event' ? (
        <EventTemplate w={w} {...templateProps} />
      ) : (
        <StandardTemplate
          w={w}
          h={h}
          title={copy.title}
          sub={copy.sub}
          {...templateProps}
        />
      )}
      <AchievementBadge
        w={w}
        h={h}
        achievement={copy.achievement}
        branding={branding}
        headingFont={copy.headingFont}
        bodyFont={copy.bodyFont}
      />
      <TemplateExtras h={h} {...templateProps} />
      <SponsorBar
        w={w}
        h={h}
        sponsors={sponsors}
        branding={branding}
        bodyFont={copy.bodyFont}
      />
      <DragSurface
        w={w}
        h={h}
        backgroundHero={project.heroImage}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onBackgroundPointerMove}
        onPointerUp={onBackgroundPointerUp}
      />
    </>
  );
}
