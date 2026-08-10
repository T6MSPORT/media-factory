import type { PointerEvent as ReactPointerEvent, Ref } from 'react';
import type { Data, Project, Sponsor } from '../../types';
import { getCanvasDimensions } from '../../utils/format';
import { GraphicScene } from './GraphicScene';
import { useHeroDimensions } from './useHeroDimensions';

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
  const { width: w, height: h } = getCanvasDimensions(project);
  const loadedHeroSize = useHeroDimensions(project);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className="graphic"
      overflow="hidden"
    >
      <GraphicScene
        w={w}
        h={h}
        project={project}
        data={data}
        sponsors={sponsors}
        loadedHeroSize={loadedHeroSize}
        onBackgroundPointerDown={onBackgroundPointerDown}
        onBackgroundPointerMove={onBackgroundPointerMove}
        onBackgroundPointerUp={onBackgroundPointerUp}
      />
    </svg>
  );
}
