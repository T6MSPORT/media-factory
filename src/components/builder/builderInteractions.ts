import type { FormatId, Project } from '../../types';
import { exportSvgAsPng } from '../../utils/export';
import { getCanvasDimensions } from '../../utils/format';

export type BackgroundDragState = {
  clientX: number;
  clientY: number;
  heroX: number;
  heroY: number;
  pointerId: number;
};

type Point = {
  clientX: number;
  clientY: number;
  pointerId: number;
};

type PreviewSize = {
  width: number;
  height: number;
};

type ImageSize = {
  width: number;
  height: number;
};

type ProjectPatch = (patch: Partial<Project>) => void;
type PngExporter = (
  node: SVGSVGElement,
  format: FormatId,
  projectName: string,
  customWidth?: number,
  customHeight?: number,
) => Promise<void>;

export const centreBackgroundPatch: Partial<Project> = {
  heroX: 0,
  heroY: 0,
};

export const zoomBackgroundToFillPatch: Partial<Project> = {
  heroX: 0,
  heroY: 0,
  heroScale: 1,
};

export const resetBackgroundPatch: Partial<Project> = {
  heroX: 0,
  heroY: 0,
  heroScale: 1,
  heroFlip: false,
};

export const removeBackgroundHeroPatch: Partial<Project> = {
  heroImage: '',
  heroImageWidth: 0,
  heroImageHeight: 0,
  heroOverlayOpacity: 0,
  ...resetBackgroundPatch,
};

export const resetDriverPatch: Partial<Project> = {
  driverX: 0,
  driverY: 0,
  driverScale: 1,
};

export function createBackgroundDrag(
  project: Project,
  point: Point,
): BackgroundDragState {
  return {
    clientX: point.clientX,
    clientY: point.clientY,
    heroX: project.heroX,
    heroY: project.heroY,
    pointerId: point.pointerId,
  };
}

export function getBackgroundDragPatch(
  drag: BackgroundDragState,
  point: Point,
  preview: PreviewSize,
  formatOrProject: FormatId | Pick<Project, 'format'|'customWidth'|'customHeight'>,
): Partial<Project> | null {
  if (
    drag.pointerId !== point.pointerId ||
    preview.width <= 0 ||
    preview.height <= 0
  ) {
    return null;
  }

  const canvas = getCanvasDimensions(formatOrProject);
  const deltaX = (point.clientX - drag.clientX) * (canvas.width / preview.width);
  const deltaY = (point.clientY - drag.clientY) * (canvas.height / preview.height);

  return {
    heroX: Math.round(drag.heroX + deltaX),
    heroY: Math.round(drag.heroY + deltaY),
  };
}

export function getUploadedHeroPatch(
  heroImage: string,
  size: ImageSize,
): Partial<Project> {
  return {
    heroImage,
    heroImageWidth: size.width,
    heroImageHeight: size.height,
    heroX: 0,
    heroY: 0,
    heroScale: 1,
    heroOverlayOpacity: 0,
  };
}

export async function exportProjectPng(
  node: SVGSVGElement,
  project: Project,
  patch: ProjectPatch,
  exporter: PngExporter = exportSvgAsPng,
  now: () => string = () => new Date().toISOString(),
): Promise<boolean> {
  try {
    await exporter(
      node,
      project.format,
      project.name,
      project.customWidth,
      project.customHeight,
    );
    patch({ exportedAt: project.exportedAt || now() });
    return true;
  } catch (error) {
    console.error('Media Factory could not export this graphic.', error);
    return false;
  }
}
