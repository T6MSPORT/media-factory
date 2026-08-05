import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import {
  createBackgroundDrag,
  getBackgroundDragPatch,
  type BackgroundDragState,
} from '../components/builder/builderInteractions';
import type { Project } from '../types';

type ProjectPatch = (patch: Partial<Project>) => void;

export function useBackgroundDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  project: Project,
  patch: ProjectPatch,
) {
  const dragRef = useRef<BackgroundDragState | null>(null);

  const onPointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!project.heroImage) return;

    dragRef.current = createBackgroundDrag(project, event);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !svg) return;

    const rect = svg.getBoundingClientRect();
    const nextPatch = getBackgroundDragPatch(drag, event, rect, project);
    if (nextPatch) patch(nextPatch);
  };

  const onPointerUp = (event: ReactPointerEvent<SVGRectElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}
