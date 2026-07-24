import { useEffect, useState, type PointerEvent as ReactPointerEvent, type Ref } from 'react';
import type { Data, Project, Sponsor } from '../../types';
import { getCanvasDimensions } from '../../utils/format';
import { getImageDimensions } from '../../utils/images';
import {
  BackgroundLayers,
  BrandLogos,
  DragSurface,
  SponsorBar,
} from './GraphicLayers';
import {
  AchievementBadge,
  EventTemplate,
  StandardTemplate,
  TemplateExtras,
} from './GraphicTemplates';
import { getGraphicCopy } from './rendererCalculations';

type GraphicProps = {
  project: Project;
  data: Data;
  sponsors: Sponsor[];
  ref: Ref<SVGSVGElement>;
  onBackgroundPointerDown?: (event: ReactPointerEvent<SVGRectElement>) => void;
  onBackgroundPointerMove?: (event: ReactPointerEvent<SVGRectElement>) => void;
  onBackgroundPointerUp?: (event: ReactPointerEvent<SVGRectElement>) => void;
};

export function Graphic({
  project,
  data,
  sponsors,
  ref,
  onBackgroundPointerDown,
  onBackgroundPointerMove,
  onBackgroundPointerUp,
}: GraphicProps) {
  const { width: w, height: h } = getCanvasDimensions(project.format);
  const profile = data.profile;
  const branding = data.branding;
  const backgroundHero = project.heroImage;
  const [loadedHeroSize, setLoadedHeroSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    if (!backgroundHero) {
      setLoadedHeroSize(null);
      return;
    }
    if (project.heroImageWidth && project.heroImageHeight) {
      setLoadedHeroSize({
        width: project.heroImageWidth,
        height: project.heroImageHeight,
      });
      return;
    }
    getImageDimensions(backgroundHero)
      .then(size => {
        if (active) setLoadedHeroSize(size);
      })
      .catch(() => {
        if (active) setLoadedHeroSize(null);
      });
    return () => {
      active = false;
    };
  }, [backgroundHero, project.heroImageWidth, project.heroImageHeight]);

  const { achievement, title, sub, headingFont, bodyFont } = getGraphicCopy(
    project,
    profile,
    branding,
  );

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className="graphic"
    >
      <BackgroundLayers
        w={w}
        h={h}
        project={project}
        branding={branding}
        loadedHeroSize={loadedHeroSize}
        driverImage={profile.driverImage}
      />
      {project.template === 'event' ? (
        <EventTemplate
          w={w}
          project={project}
          profile={profile}
          branding={branding}
          headingFont={headingFont}
          bodyFont={bodyFont}
        />
      ) : (
        <StandardTemplate
          h={h}
          project={project}
          profile={profile}
          branding={branding}
          title={title}
          sub={sub}
          headingFont={headingFont}
          bodyFont={bodyFont}
        />
      )}
      <AchievementBadge
        w={w}
        h={h}
        achievement={achievement}
        branding={branding}
        headingFont={headingFont}
        bodyFont={bodyFont}
      />
      <TemplateExtras
        h={h}
        project={project}
        profile={profile}
        branding={branding}
        headingFont={headingFont}
        bodyFont={bodyFont}
      />
      <SponsorBar
        w={w}
        h={h}
        sponsors={sponsors}
        branding={branding}
        bodyFont={bodyFont}
      />
      <DragSurface
        w={w}
        h={h}
        backgroundHero={backgroundHero}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onBackgroundPointerMove}
        onPointerUp={onBackgroundPointerUp}
      />
      <BrandLogos w={w} project={project} profile={profile} />
    </svg>
  );
}
