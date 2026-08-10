import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import {
  createBackgroundDrag,
  getBackgroundDragPatch,
  getBackgroundPinchScale,
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
  const pointersRef = useRef(new Map<number, { clientX: number; clientY: number }>());
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  const pointerDistance = () => {
    const [first, second] = [...pointersRef.current.values()];
    return first && second ? Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY) : 0;
  };

  const onPointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!project.heroImage) return;

    pointersRef.current.set(event.pointerId, event);
    dragRef.current = createBackgroundDrag(project, event);
    if (pointersRef.current.size === 2) {
      pinchRef.current = { distance: pointerDistance(), scale: project.heroScale };
      dragRef.current = null;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, event);
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      event.preventDefault();
      patch({
        heroScale: getBackgroundPinchScale(
          pinchRef.current.scale,
          pinchRef.current.distance,
          pointerDistance(),
        ),
      });
      return;
    }

    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !svg) return;

    const rect = svg.getBoundingClientRect();
    const nextPatch = getBackgroundDragPatch(drag, event, rect, project);
    if (nextPatch) patch(nextPatch);
  };

  const onPointerUp = (event: ReactPointerEvent<SVGRectElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
    const remaining = [...pointersRef.current.entries()][0];
    if (remaining) {
      dragRef.current = createBackgroundDrag(project, {
        ...remaining[1],
        pointerId: remaining[0],
      });
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}
