import { useEffect, useState } from 'react';
import type { Project } from '../../types';
import { getImageDimensions } from '../../utils/images';

export type HeroDimensions = {
  width: number;
  height: number;
};

export function useHeroDimensions(project: Project) {
  const backgroundHero = project.heroImage;
  const [loadedHeroSize, setLoadedHeroSize] =
    useState<HeroDimensions | null>(null);

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

  return loadedHeroSize;
}
