import type { Branding, GraphicElementId, Project } from '../../types';

export const GRAPHIC_ELEMENTS: Array<{
  id: Exclude<GraphicElementId, 'none'>;
  name: string;
}> = [
  { id: 'chevrons', name: 'Apex chevron pattern' },
  { id: 'speed-lines', name: 'Velocity line pattern' },
  { id: 'corner-frame', name: 'Techwear stitch pattern' },
  { id: 'grid', name: 'Perspective grid pattern' },
  { id: 'dot-matrix', name: 'Telemetry dot pattern' },
  { id: 'crosshair', name: 'Coordinate grid pattern' },
  { id: 'racing-stripes', name: 'Racing line pattern' },
  { id: 'apex-arc', name: 'Apex contour pattern' },
  { id: 'split-blocks', name: 'Aero panel pattern' },
  { id: 'slash-stack', name: 'Velocity slash pattern' },
  { id: 'diamond', name: 'Circuit diamond mesh' },
  { id: 'hexagon', name: 'Hex tech mesh' },
  { id: 'circle-ring', name: 'Rev counter pattern' },
  { id: 'triangle', name: 'Delta mesh pattern' },
  { id: 'checkered-panel', name: 'Chequered pattern' },
  { id: 'tech-bracket', name: 'HUD bracket pattern' },
  { id: 'wave', name: 'Aero flow pattern' },
  { id: 'starburst', name: 'Speed fan pattern' },
  { id: 'target', name: 'Telemetry trace pattern' },
  { id: 'wing', name: 'Aero blade pattern' },
];

type PatternProps = {
  id: Exclude<GraphicElementId, 'none'>;
  primary: string;
  accent: string;
  patternId: string;
};

function PatternTile({
  id,
  primary,
  accent,
}: Omit<PatternProps, 'patternId'>) {
  const line = {
    fill: 'none',
    stroke: primary,
    strokeWidth: 1.5,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  switch (id) {
    case 'chevrons':
      return (
        <g {...line}>
          <path d="M-8 0 L8 12 L-8 24 M8 0 L24 12 L8 24 M24 0 L40 12 L24 24" />
          <path d="M0 0 L16 12 L0 24 M16 0 L32 12 L16 24" stroke={accent} opacity=".45" />
        </g>
      );
    case 'speed-lines':
      return (
        <g fill={primary}>
          <path d="M0 2 H34 L28 6 H0 Z M0 10 H22 L17 13 H0 Z M0 17 H39 L32 21 H0 Z" />
          <path d="M25 10 H40 L35 13 H20 Z" fill={accent} opacity=".65" />
        </g>
      );
    case 'corner-frame':
      return (
        <g {...line}>
          <path d="M1 9 V1 H9 M31 1 H39 V9 M39 15 V23 H31 M9 23 H1 V15" />
          <path d="M6 7 V5 H12 M28 5 H34 V7 M34 17 V19 H28 M12 19 H6 V17" stroke={accent} opacity=".55" />
        </g>
      );
    case 'grid':
      return (
        <g {...line} opacity=".8">
          <path d="M0 0 H40 M0 12 H40 M0 24 H40 M0 0 V24 M20 0 V24 M40 0 V24" />
          <path d="M0 24 L20 0 L40 24" stroke={accent} opacity=".35" />
        </g>
      );
    case 'dot-matrix':
      return (
        <g fill={primary}>
          {[4, 12, 20, 28, 36].flatMap((x, column) =>
            [4, 12, 20].map((y, row) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={1 + ((row + column) % 3) * 0.55}
                opacity={0.35 + ((row + column) % 3) * 0.23}
              />
            )),
          )}
          <rect x="27" y="17" width="7" height="2" fill={accent} opacity=".7" />
        </g>
      );
    case 'crosshair':
      return (
        <g {...line}>
          <path d="M0 6 H40 M0 18 H40 M10 0 V24 M30 0 V24" opacity=".42" />
          <path d="M4 12 H16 M24 12 H36 M20 2 V9 M20 15 V22" stroke={accent} />
          <circle cx="20" cy="12" r="2" />
        </g>
      );
    case 'racing-stripes':
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M-8 25 C1 5 18 3 29 14 C35 20 41 20 48 10" stroke={primary} strokeWidth="6" />
          <path d="M-8 25 C1 5 18 3 29 14 C35 20 41 20 48 10" stroke={accent} strokeWidth="1.25" strokeDasharray="4 4" />
        </g>
      );
    case 'apex-arc':
      return (
        <g {...line} strokeLinecap="round">
          <path d="M-2 23 A24 24 0 0 1 22 -1 M8 25 A24 24 0 0 1 32 1 M18 25 A24 24 0 0 1 42 1" />
          <path d="M4 23 A24 24 0 0 1 28 -1" stroke={accent} strokeWidth="3" opacity=".55" />
        </g>
      );
    case 'split-blocks':
      return (
        <g fill={primary}>
          <path d="M0 2 H23 L18 10 H0 Z M20 2 H40 V10 H15 Z M0 14 H15 L10 22 H0 Z M12 14 H34 L29 22 H7 Z" />
          <path d="M31 14 H40 V22 H26 Z" fill={accent} opacity=".7" />
        </g>
      );
    case 'slash-stack':
      return (
        <g fill={primary}>
          <path d="M-5 24 L7 0 H13 L1 24 Z M9 24 L21 0 H27 L15 24 Z M23 24 L35 0 H41 L29 24 Z" />
          <path d="M36 24 L40 16 V24 Z" fill={accent} />
        </g>
      );
    case 'diamond':
      return (
        <g {...line}>
          <path d="M0 12 L10 0 L20 12 L10 24 Z M20 12 L30 0 L40 12 L30 24 Z" />
          <path d="M10 0 L20 12 L10 24 L0 12 M30 0 L40 12 L30 24 L20 12" stroke={accent} opacity=".42" />
        </g>
      );
    case 'hexagon':
      return (
        <g {...line}>
          <path d="M3 6 L10 2 L17 6 V14 L10 18 L3 14 Z M23 6 L30 2 L37 6 V14 L30 18 L23 14 Z" />
          <path d="M13 18 L20 14 L27 18 V26 L20 30 L13 26 Z" stroke={accent} opacity=".5" />
        </g>
      );
    case 'circle-ring':
      return (
        <g {...line}>
          <path d="M4 18 A10 10 0 0 1 20 6 M24 18 A10 10 0 0 1 40 6" strokeWidth="3" strokeDasharray="4 2" />
          <path d="M5 20 H19 M25 20 H39" stroke={accent} />
          <path d="M8 17 L12 11 M28 17 L34 9" />
        </g>
      );
    case 'triangle':
      return (
        <g {...line}>
          <path d="M0 24 L10 4 L20 24 Z M20 24 L30 4 L40 24 Z M10 4 L20 24 L30 4 Z" />
          <path d="M10 14 L15 24 H5 Z M30 14 L35 24 H25 Z" stroke={accent} opacity=".55" />
        </g>
      );
    case 'checkered-panel':
      return (
        <g fill={primary}>
          {[0, 1, 2].flatMap(row =>
            [0, 1, 2, 3, 4].map(column =>
              (row + column) % 2 ? (
                <path
                  key={`${row}-${column}`}
                  d={`M${column * 8} ${row * 8} h8 l-2 8 h-8 Z`}
                />
              ) : null,
            ),
          )}
          <path d="M0 23 H40" stroke={accent} strokeWidth="1.5" opacity=".55" />
        </g>
      );
    case 'tech-bracket':
      return (
        <g {...line}>
          <path d="M1 9 V2 H9 M15 2 H23 M31 2 H39 V9 M39 15 V22 H31 M25 22 H17 M9 22 H1 V15" />
          <path d="M8 8 H14 V5 M32 16 H26 V19" stroke={accent} />
        </g>
      );
    case 'wave':
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M-4 6 C5 0 11 12 20 6 C29 0 35 12 44 6 M-4 13 C5 7 11 19 20 13 C29 7 35 19 44 13 M-4 20 C5 14 11 26 20 20 C29 14 35 26 44 20" stroke={primary} strokeWidth="2" />
          <path d="M-4 16 C5 10 11 22 20 16 C29 10 35 22 44 16" stroke={accent} />
        </g>
      );
    case 'starburst':
      return (
        <g fill={primary}>
          <path d="M-7 24 L9 0 H14 L3 24 Z M4 24 L18 0 H21 L14 24 Z M17 24 L27 0 H30 L27 24 Z M30 24 L36 0 H39 L40 24 Z" />
          <path d="M12 24 L24 0 H27 L22 24 Z" fill={accent} opacity=".7" />
        </g>
      );
    case 'target':
      return (
        <g {...line}>
          <path d="M0 17 H6 L10 8 L15 21 L20 12 L25 15 L30 4 L35 17 H40" />
          <path d="M0 22 H40 M0 2 V22 M10 2 V22 M20 2 V22 M30 2 V22 M40 2 V22" opacity=".25" />
          <circle cx="30" cy="4" r="2" fill={accent} stroke="none" />
        </g>
      );
    case 'wing':
      return (
        <g fill={primary}>
          <path d="M-5 10 L11 1 H33 L18 10 Z M3 16 L16 9 H36 L24 16 Z M12 22 L22 16 H41 L31 22 Z" />
          <path d="M28 22 L38 16 H41 L31 22 Z" fill={accent} />
        </g>
      );
  }
}

function PatternArtwork({ id, primary, accent, patternId }: PatternProps) {
  return (
    <>
      <defs>
        <pattern
          id={patternId}
          width="40"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform="skewX(-8)"
        >
          <PatternTile id={id} primary={primary} accent={accent} />
        </pattern>
      </defs>
      <rect x="-45" y="-12" width="190" height="124" fill={`url(#${patternId})`} />
      <path
        d="M-40 8 H28 L36 2 H140 M-40 94 H62 L70 100 H140"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        opacity=".42"
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
}

export function GraphicElementLayer({
  w,
  h,
  project,
  branding,
}: {
  w: number;
  h: number;
  project: Project;
  branding: Branding;
}) {
  const id = project.graphicElement || 'none';
  if (id === 'none') return null;

  const x = Number((w * ((project.graphicElementX ?? 50) / 100)).toFixed(3));
  const y = Number((h * ((project.graphicElementY ?? 55) / 100)).toFixed(3));
  const size = Math.min(w, h) * ((project.graphicElementSize ?? 45) / 100);
  const scaleX = Number((size / 100 * 1.8).toFixed(3));
  const scaleY = Number((size / 100).toFixed(3));
  const patternId = `graphic-pattern-${id}`;

  return (
    <>
      <defs>
        <linearGradient id="graphicBackdropFade" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset=".12" stopColor="white" stopOpacity=".7" />
          <stop offset=".5" stopColor="white" />
          <stop offset=".88" stopColor="white" stopOpacity=".7" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="graphicBackdropMask">
          <rect x="-45" y="-15" width="190" height="130" fill="url(#graphicBackdropFade)" />
        </mask>
      </defs>
      <g
        data-graphic-element={id}
        data-graphic-role="background-pattern"
        transform={`translate(${x} ${y}) scale(${scaleX} ${scaleY}) translate(-50 -50)`}
        opacity=".5"
        mask="url(#graphicBackdropMask)"
        pointerEvents="none"
      >
        <PatternArtwork
          id={id}
          primary={branding.primary}
          accent={branding.accent}
          patternId={patternId}
        />
      </g>
    </>
  );
}
