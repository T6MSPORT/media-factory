import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import type { Project } from '../types';
import { getCanvasDimensions } from '../utils/format';

type ProjectPatch = (patch: Partial<Project>) => void;

type DragState = {
  clientX: number;
  clientY: number;
  heroX: number;
  heroY: number;
  pointerId: number;
};

export function useBackgroundDrag(
  svgRef: RefObject<SVGSVGElement | null>,
  project: Project,
  patch: ProjectPatch,
) {
  const dragRef = useRef<DragState | null>(null);

  const onPointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!project.heroImage) return;

    dragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      heroX: project.heroX,
      heroY: project.heroY,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !svg) return;

    const rect = svg.getBoundingClientRect();
    const { width, height } = getCanvasDimensions(project.format);
    const deltaX = (event.clientX - drag.clientX) * (width / rect.width);
    const deltaY = (event.clientY - drag.clientY) * (height / rect.height);

    patch({
      heroX: Math.round(drag.heroX + deltaX),
      heroY: Math.round(drag.heroY + deltaY),
    });
  };

  const onPointerUp = (event: ReactPointerEvent<SVGRectElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}
