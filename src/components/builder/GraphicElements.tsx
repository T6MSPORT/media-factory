import type { Branding, GraphicElementId, Project } from '../../types';

export const GRAPHIC_ELEMENTS: Array<{
  id: Exclude<GraphicElementId, 'none'>;
  name: string;
}> = [
  { id: 'chevrons', name: 'Chevrons' },
  { id: 'speed-lines', name: 'Speed lines' },
  { id: 'corner-frame', name: 'Corner frame' },
  { id: 'grid', name: 'Grid' },
  { id: 'dot-matrix', name: 'Dot matrix' },
  { id: 'crosshair', name: 'Crosshair' },
  { id: 'racing-stripes', name: 'Racing stripes' },
  { id: 'apex-arc', name: 'Apex arc' },
  { id: 'split-blocks', name: 'Split blocks' },
  { id: 'slash-stack', name: 'Slash stack' },
  { id: 'diamond', name: 'Diamond' },
  { id: 'hexagon', name: 'Hexagon' },
  { id: 'circle-ring', name: 'Circle ring' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'checkered-panel', name: 'Checkered panel' },
  { id: 'tech-bracket', name: 'Tech bracket' },
  { id: 'wave', name: 'Wave' },
  { id: 'starburst', name: 'Starburst' },
  { id: 'target', name: 'Target' },
  { id: 'wing', name: 'Wing' },
];

function ElementArtwork({
  id,
  primary,
  accent,
}: {
  id: Exclude<GraphicElementId, 'none'>;
  primary: string;
  accent: string;
}) {
  const strokeProps = {
    fill: 'none',
    stroke: primary,
    strokeWidth: 5,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  switch (id) {
    case 'chevrons':
      return (
        <g {...strokeProps} strokeLinejoin="miter">
          {[8, 30, 52, 74].map(x => (
            <path key={x} d={`M${x} 18 L${x + 18} 50 L${x} 82`} />
          ))}
        </g>
      );
    case 'speed-lines':
      return (
        <g fill={primary}>
          <path d="M5 22 H95 L80 34 H5 Z" />
          <path d="M5 44 H78 L63 56 H5 Z" opacity=".8" />
          <path d="M5 66 H58 L43 78 H5 Z" opacity=".6" />
        </g>
      );
    case 'corner-frame':
      return (
        <g {...strokeProps} strokeLinecap="square">
          <path d="M8 38 V8 H38 M62 8 H92 V38" />
          <path d="M92 62 V92 H62 M38 92 H8 V62" />
        </g>
      );
    case 'grid':
      return (
        <g stroke={primary} strokeWidth="2" opacity=".85">
          {[10, 30, 50, 70, 90].map(value => (
            <g key={value}>
              <line x1={value} y1="5" x2={value} y2="95" />
              <line x1="5" y1={value} x2="95" y2={value} />
            </g>
          ))}
        </g>
      );
    case 'dot-matrix':
      return (
        <g fill={primary}>
          {[14, 32, 50, 68, 86].flatMap(y =>
            [14, 32, 50, 68, 86].map(x => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />
            )),
          )}
        </g>
      );
    case 'crosshair':
      return (
        <g {...strokeProps}>
          <circle cx="50" cy="50" r="28" />
          <circle cx="50" cy="50" r="5" fill={primary} />
          <path d="M50 4 V30 M50 70 V96 M4 50 H30 M70 50 H96" />
        </g>
      );
    case 'racing-stripes':
      return (
        <g transform="rotate(-16 50 50)">
          <rect x="12" y="4" width="22" height="92" fill={primary} />
          <rect x="39" y="4" width="8" height="92" fill={accent} />
          <rect x="52" y="4" width="36" height="92" fill={primary} />
        </g>
      );
    case 'apex-arc':
      return (
        <g {...strokeProps} strokeLinecap="round">
          <path d="M10 88 A78 78 0 0 1 88 10" strokeWidth="10" />
          <path d="M28 88 A60 60 0 0 1 88 28" stroke={accent} strokeWidth="3" />
        </g>
      );
    case 'split-blocks':
      return (
        <g fill={primary}>
          <path d="M5 12 H62 L48 42 H5 Z" />
          <path d="M38 58 H95 V88 H24 Z" opacity=".75" />
          <path d="M68 12 H95 V42 H54 Z" fill={accent} />
        </g>
      );
    case 'slash-stack':
      return (
        <g fill={primary} transform="skewX(-18)">
          {[8, 30, 52, 74].map(x => (
            <rect key={x} x={x} y="10" width="13" height="80" />
          ))}
        </g>
      );
    case 'diamond':
      return (
        <g {...strokeProps}>
          <path d="M50 5 L95 50 L50 95 L5 50 Z" strokeWidth="7" />
          <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 'hexagon':
      return (
        <g {...strokeProps}>
          <path d="M27 7 H73 L96 50 L73 93 H27 L4 50 Z" strokeWidth="7" />
          <circle cx="50" cy="50" r="5" fill={accent} stroke="none" />
        </g>
      );
    case 'circle-ring':
      return (
        <g {...strokeProps}>
          <circle cx="50" cy="50" r="39" strokeWidth="11" />
          <path d="M50 4 V22 M50 78 V96" stroke={accent} strokeWidth="3" />
        </g>
      );
    case 'triangle':
      return (
        <g {...strokeProps}>
          <path d="M50 7 L94 88 H6 Z" strokeWidth="8" />
          <path d="M50 28 L74 74 H26 Z" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 'checkered-panel':
      return (
        <g>
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 6 }, (_, column) => (
              <rect
                key={`${row}-${column}`}
                x={column * 16 + 2}
                y={row * 16 + 2}
                width="16"
                height="16"
                fill={(row + column) % 2 ? primary : accent}
              />
            )),
          )}
        </g>
      );
    case 'tech-bracket':
      return (
        <g {...strokeProps} strokeLinecap="square">
          <path d="M8 42 V14 H36 L44 6 M92 42 V14 H64 L56 6" />
          <path d="M8 58 V86 H36 L44 94 M92 58 V86 H64 L56 94" />
          <path d="M42 50 H58" stroke={accent} strokeWidth="3" />
        </g>
      );
    case 'wave':
      return (
        <g {...strokeProps} strokeLinecap="round">
          <path d="M4 35 C20 10 34 60 50 35 S80 10 96 35" strokeWidth="7" />
          <path d="M4 62 C20 37 34 87 50 62 S80 37 96 62" stroke={accent} strokeWidth="3" />
        </g>
      );
    case 'starburst':
      return (
        <g transform="translate(50 50)">
          {Array.from({ length: 16 }, (_, index) => (
            <path
              key={index}
              d="M-2 -12 L0 -47 L2 -12 Z"
              fill={index % 2 ? accent : primary}
              transform={`rotate(${index * 22.5})`}
            />
          ))}
          <circle r="9" fill={primary} />
        </g>
      );
    case 'target':
      return (
        <g {...strokeProps}>
          <circle cx="50" cy="50" r="42" strokeWidth="3" />
          <circle cx="50" cy="50" r="27" strokeWidth="7" />
          <circle cx="50" cy="50" r="9" fill={accent} stroke="none" />
        </g>
      );
    case 'wing':
      return (
        <g fill={primary}>
          <path d="M5 52 L40 18 H95 L62 42 H35 Z" />
          <path d="M5 70 L32 48 H72 L48 70 Z" opacity=".78" />
          <path d="M5 84 L25 68 H50 L34 84 Z" fill={accent} opacity=".9" />
        </g>
      );
  }
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
  const scale = Number((size / 100).toFixed(3));

  return (
    <g
      data-graphic-element={id}
      transform={`translate(${x} ${y}) scale(${scale}) translate(-50 -50)`}
      opacity=".82"
      pointerEvents="none"
    >
      <ElementArtwork
        id={id}
        primary={branding.primary}
        accent={branding.accent}
      />
    </g>
  );
}
