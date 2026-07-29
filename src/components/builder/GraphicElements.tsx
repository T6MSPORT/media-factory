import type { Branding, GraphicElementId, Project } from '../../types';

export const GRAPHIC_ELEMENTS: Array<{
  id: Exclude<GraphicElementId, 'none'>;
  name: string;
}> = [
  { id: 'chevrons', name: 'Apex chevrons' },
  { id: 'speed-lines', name: 'Velocity bars' },
  { id: 'corner-frame', name: 'Techwear corners' },
  { id: 'grid', name: 'Perspective grid' },
  { id: 'dot-matrix', name: 'Telemetry matrix' },
  { id: 'crosshair', name: 'Driver target' },
  { id: 'racing-stripes', name: 'Racing line' },
  { id: 'apex-arc', name: 'Apex sweep' },
  { id: 'split-blocks', name: 'Aero panels' },
  { id: 'slash-stack', name: 'Velocity slashes' },
  { id: 'diamond', name: 'Circuit marker' },
  { id: 'hexagon', name: 'Hex tech' },
  { id: 'circle-ring', name: 'Rev ring' },
  { id: 'triangle', name: 'Delta frame' },
  { id: 'checkered-panel', name: 'Chequered panel' },
  { id: 'tech-bracket', name: 'HUD brackets' },
  { id: 'wave', name: 'Aero flow' },
  { id: 'starburst', name: 'Turbine burst' },
  { id: 'target', name: 'Telemetry dial' },
  { id: 'wing', name: 'Aero blades' },
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
          <path d="M5 40 V14 L14 5 H42 M58 5 H86 L95 14 V40" />
          <path d="M95 60 V86 L86 95 H58 M42 95 H14 L5 86 V60" />
          <path d="M14 32 V20 L20 14 H34 M66 14 H80 L86 20 V32" stroke={accent} strokeWidth="2" />
          <path d="M86 68 V80 L80 86 H66 M34 86 H20 L14 80 V68" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 'grid':
      return (
        <g stroke={primary} fill="none" opacity=".85">
          {[8, 26, 50, 74, 92].map(x => (
            <path key={x} d={`M50 8 L${x} 94`} strokeWidth="1.8" />
          ))}
          {[30, 48, 65, 80, 94].map((y, index) => (
            <path
              key={y}
              d={`M${18 - index * 3} ${y} H${82 + index * 3}`}
              strokeWidth={index === 4 ? 3 : 1.8}
            />
          ))}
          <path d="M44 8 H56" stroke={accent} strokeWidth="4" />
        </g>
      );
    case 'dot-matrix':
      return (
        <g fill={primary}>
          {[16, 33, 50, 67, 84].flatMap((y, row) =>
            [16, 33, 50, 67, 84].map((x, column) => (
              <rect
                key={`${x}-${y}`}
                x={x - (row + column) % 3 - 2}
                y={y - (row + column) % 3 - 2}
                width={(row + column) % 3 + 4}
                height={(row + column) % 3 + 4}
                transform={`rotate(45 ${x} ${y})`}
                opacity={0.45 + ((row + column) % 3) * 0.25}
              />
            )),
          )}
          <path d="M8 91 H54 L64 81 H92" fill="none" stroke={accent} strokeWidth="2" />
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
        <g fill="none" strokeLinecap="round">
          <path d="M8 92 C12 58 28 22 59 16 C75 13 86 20 92 31" stroke={primary} strokeWidth="12" />
          <path d="M8 92 C12 58 28 22 59 16 C75 13 86 20 92 31" stroke={accent} strokeWidth="3" strokeDasharray="9 8" />
          <path d="M22 94 C26 67 38 38 62 32 C74 29 82 33 89 42" stroke={primary} strokeWidth="3" opacity=".7" />
          <path d="M2 78 L13 90 L27 87" stroke={accent} strokeWidth="3" />
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
          <path d="M4 17 H58 L47 42 H4 Z" />
          <path d="M42 17 H96 L85 42 H53 Z" opacity=".55" />
          <path d="M4 51 H38 L27 76 H4 Z" opacity=".55" />
          <path d="M31 51 H88 L77 76 H20 Z" />
          <path d="M81 51 H96 V76 H70 Z" fill={accent} />
          <path d="M4 84 H68" stroke={accent} strokeWidth="4" />
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
          <path d="M50 4 L96 50 L50 96 L4 50 Z" strokeWidth="6" strokeDasharray="48 8 16 8" />
          <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke={accent} strokeWidth="2" />
          <path d="M4 50 H25 M75 50 H96 M50 4 V25 M50 75 V96" strokeWidth="2" />
          <circle cx="50" cy="50" r="5" fill={primary} stroke="none" />
        </g>
      );
    case 'hexagon':
      return (
        <g {...strokeProps}>
          <path d="M26 6 H74 L96 50 L74 94 H26 L4 50 Z" strokeWidth="5" strokeDasharray="50 7" />
          <path d="M34 20 H66 L81 50 L66 80 H34 L19 50 Z" stroke={accent} strokeWidth="2" />
          <path d="M27 35 H43 L50 50 L43 65 H27 L20 50 Z" fill={primary} stroke="none" opacity=".7" />
          <path d="M57 35 H73 L80 50 L73 65 H57 L50 50 Z" fill={primary} stroke="none" opacity=".35" />
        </g>
      );
    case 'circle-ring':
      return (
        <g {...strokeProps}>
          <circle cx="50" cy="50" r="40" strokeWidth="8" strokeDasharray="64 10 18 10" />
          <circle cx="50" cy="50" r="29" stroke={accent} strokeWidth="2" strokeDasharray="4 7" />
          {[18, 34, 50, 66, 82].map((x, index) => (
            <rect key={x} x={x - 4} y={72 - index * 7} width="8" height={index * 7 + 10} fill={primary} stroke="none" opacity={0.4 + index * 0.13} />
          ))}
        </g>
      );
    case 'triangle':
      return (
        <g {...strokeProps}>
          <path d="M50 5 L96 89 H4 Z" strokeWidth="6" strokeDasharray="62 9 24 9" />
          <path d="M50 24 L79 77 H21 Z" stroke={accent} strokeWidth="2" />
          <path d="M50 5 V31 M4 89 L27 75 M96 89 L73 75" strokeWidth="2" />
          <path d="M43 55 H57 L64 68 H36 Z" fill={primary} stroke="none" />
        </g>
      );
    case 'checkered-panel':
      return (
        <g>
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 6 }, (_, column) =>
              (row + column) % 2 ? (
                <path
                  key={`${row}-${column}`}
                  d={`M${column * 16 + 2} ${row * 16 + 2} h16 l-4 16 h-16 Z`}
                  fill={primary}
                />
              ) : null,
            ),
          )}
          <path d="M2 2 H98 M-22 98 H74" stroke={primary} strokeWidth="3" opacity=".65" />
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
        <g fill="none" strokeLinecap="round">
          <path d="M3 78 C27 80 21 26 55 24 C73 23 82 37 97 31" stroke={primary} strokeWidth="9" />
          <path d="M3 89 C36 91 29 39 58 36 C76 34 85 46 97 42" stroke={primary} strokeWidth="4" opacity=".7" />
          <path d="M3 66 C19 68 19 17 52 12 C73 9 85 23 97 18" stroke={accent} strokeWidth="3" strokeDasharray="13 7" />
          <path d="M68 57 H92 L97 52" stroke={primary} strokeWidth="2" />
        </g>
      );
    case 'starburst':
      return (
        <g transform="translate(50 50)">
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              d="M-5 -18 L-2 -46 L6 -39 L4 -17 Z"
              fill={index % 3 === 0 ? accent : primary}
              opacity={index % 2 ? '.55' : '1'}
              transform={`rotate(${index * 30})`}
            />
          ))}
          <circle r="22" fill="none" stroke={primary} strokeWidth="6" strokeDasharray="18 5" />
          <circle r="11" fill={accent} />
          <path d="M-4 -5 L8 0 L-4 5 Z" fill={primary} />
        </g>
      );
    case 'target':
      return (
        <g {...strokeProps}>
          <path d="M50 7 A43 43 0 0 1 91 38 M93 56 A43 43 0 0 1 61 91 M41 92 A43 43 0 0 1 8 61 M8 41 A43 43 0 0 1 39 8" strokeWidth="5" />
          <circle cx="50" cy="50" r="27" stroke={accent} strokeWidth="2" strokeDasharray="5 5" />
          <path d="M50 20 V50 L70 64" strokeWidth="5" />
          <circle cx="50" cy="50" r="7" fill={primary} stroke="none" />
          <path d="M17 74 H38" stroke={accent} strokeWidth="4" />
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
  const scaleX = Number((size / 100 * 1.8).toFixed(3));
  const scaleY = Number((size / 100).toFixed(3));

  return (
    <>
      <defs>
        <linearGradient id="graphicBackdropFade" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset=".18" stopColor="white" stopOpacity=".72" />
          <stop offset=".5" stopColor="white" />
          <stop offset=".82" stopColor="white" stopOpacity=".72" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="graphicBackdropMask">
          <rect x="-35" y="-25" width="170" height="150" fill="url(#graphicBackdropFade)" />
        </mask>
      </defs>
      <g
        data-graphic-element={id}
        data-graphic-role="background"
        transform={`translate(${x} ${y}) scale(${scaleX} ${scaleY}) translate(-50 -50)`}
        opacity=".52"
        mask="url(#graphicBackdropMask)"
        pointerEvents="none"
      >
        <g opacity=".14" transform="translate(-42 14) scale(1.28)">
          <ElementArtwork
            id={id}
            primary={branding.primary}
            accent={branding.accent}
          />
        </g>
        <g opacity=".78">
          <ElementArtwork
            id={id}
            primary={branding.primary}
            accent={branding.accent}
          />
        </g>
        <g opacity=".2" transform="translate(58 -12) scale(.82)">
          <ElementArtwork
            id={id}
            primary={branding.primary}
            accent={branding.accent}
          />
        </g>
        <path
          d="M-24 91 H31 L39 83 H124"
          fill="none"
          stroke={branding.primary}
          strokeWidth="1.5"
          opacity=".42"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </>
  );
}
