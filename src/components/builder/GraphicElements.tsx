import type { Branding, GraphicElementId, Project } from '../../types';

export const GRAPHIC_ELEMENTS: Array<{
  id: Exclude<GraphicElementId, 'none'>;
  name: string;
}> = [
  { id: 'chevrons', name: 'Apex Attack' },
  { id: 'speed-lines', name: 'Full Throttle' },
  { id: 'corner-frame', name: 'Pitwall' },
  { id: 'grid', name: 'Starting Grid' },
  { id: 'dot-matrix', name: 'LED Velocity' },
  { id: 'crosshair', name: 'Race Control' },
  { id: 'racing-stripes', name: 'Racing Line' },
  { id: 'apex-arc', name: 'Late Apex' },
  { id: 'split-blocks', name: 'Aero Cut' },
  { id: 'slash-stack', name: 'Slipstream' },
  { id: 'diamond', name: 'Carbon Shift' },
  { id: 'hexagon', name: 'Tech Sector' },
  { id: 'circle-ring', name: 'Rev Limit' },
  { id: 'triangle', name: 'Delta Force' },
  { id: 'checkered-panel', name: 'Chequered Sweep' },
  { id: 'tech-bracket', name: 'Telemetry Frame' },
  { id: 'wave', name: 'Airflow' },
  { id: 'starburst', name: 'Launch' },
  { id: 'target', name: 'Live Trace' },
  { id: 'wing', name: 'Downforce' },
];

type ArtworkProps = {
  id: Exclude<GraphicElementId, 'none'>;
  primary: string;
  accent: string;
};

const stroke = {
  fill: 'none',
  vectorEffect: 'non-scaling-stroke' as const,
};

function BackgroundArtwork({ id, primary, accent }: ArtworkProps) {
  switch (id) {
    case 'chevrons':
      return (
        <>
          <path d="M-55 94 L12 -18 H43 L-24 94 Z" fill={primary} opacity=".82" />
          <path d="M-10 105 L57 -7 H74 L7 105 Z" fill={accent} opacity=".72" />
          <path d="M35 112 L102 0 H111 L44 112 Z" fill={primary} opacity=".35" />
          <path d="M-35 82 H48 L65 54 H150" {...stroke} stroke={accent} strokeWidth="2.2" opacity=".8" />
        </>
      );
    case 'speed-lines':
      return (
        <>
          <path d="M-60 22 H72 L59 34 H-60 Z M-35 43 H121 L101 59 H-35 Z M-70 69 H61 L44 82 H-70 Z" fill={primary} opacity=".68" />
          <path d="M40 17 H151 L137 29 H26 Z M72 65 H151 L135 79 H56 Z" fill={accent} opacity=".78" />
          <path d="M-40 91 H95" {...stroke} stroke={accent} strokeWidth="2" opacity=".6" />
        </>
      );
    case 'corner-frame':
      return (
        <>
          <path d="M-42 78 L-5 3 H72 L62 17 H7 L-23 78 Z" fill={primary} opacity=".58" />
          <path d="M23 94 L44 49 H141 L129 64 H55 L41 94 Z" fill={accent} opacity=".64" />
          <path d="M-15 31 H42 L52 19 H115 M7 83 H67 L77 71 H145" {...stroke} stroke={primary} strokeWidth="2.1" opacity=".85" />
          <path d="M18 26 H31 M73 76 H90" {...stroke} stroke={accent} strokeWidth="4" />
        </>
      );
    case 'grid':
      return (
        <>
          <path d="M-55 91 L-6 8 H126 L151 91 Z" fill={primary} opacity=".15" />
          <g {...stroke} stroke={primary} strokeWidth="1.25" opacity=".72">
            <path d="M-55 91 H151 M-35 76 H136 M-18 62 H126 M-2 49 H117 M12 37 H110 M25 26 H104" />
            <path d="M-55 91 L44 8 M-4 91 L62 8 M47 91 L80 8 M98 91 L98 8 M149 91 L116 8" />
          </g>
          <path d="M-20 56 H91 L101 48 H137" {...stroke} stroke={accent} strokeWidth="2.3" />
        </>
      );
    case 'dot-matrix':
      return (
        <>
          <path d="M-45 15 H129 L151 79 H-67 Z" fill={primary} opacity=".13" />
          <g fill={primary} opacity=".72">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 16 }, (_, column) => (
                <circle
                  key={`${row}-${column}`}
                  cx={-33 + column * 11 + row * 3}
                  cy={18 + row * 8}
                  r={row % 3 === 0 ? 1.45 : 1}
                  opacity={Math.max(.18, .9 - Math.abs(column - 7) * .075)}
                />
              )),
            )}
          </g>
          <path d="M-22 71 H55 L69 58 H139" {...stroke} stroke={accent} strokeWidth="2.4" />
        </>
      );
    case 'crosshair':
      return (
        <>
          <path d="M-60 29 H50 L64 15 H151 V28 H71 L57 42 H-60 Z" fill={primary} opacity=".42" />
          <path d="M-43 67 H14 L30 51 H151 V63 H37 L21 79 H-43 Z" fill={accent} opacity=".48" />
          <g {...stroke} stroke={primary} strokeWidth="1.2" opacity=".72">
            <path d="M-22 4 V94 M9 4 V94 M40 4 V94 M71 4 V94 M102 4 V94" />
            <path d="M-50 20 H145 M-50 48 H145 M-50 76 H145" />
          </g>
        </>
      );
    case 'racing-stripes':
      return (
        <>
          <path d="M-61 88 C-12 83 4 58 28 31 C46 10 78 5 151 9" {...stroke} stroke={primary} strokeWidth="18" strokeLinecap="round" opacity=".72" />
          <path d="M-61 88 C-12 83 4 58 28 31 C46 10 78 5 151 9" {...stroke} stroke={accent} strokeWidth="4" strokeLinecap="round" opacity=".95" />
          <path d="M-53 101 C-5 94 14 67 38 41 C56 21 87 18 151 20" {...stroke} stroke={primary} strokeWidth="2" strokeDasharray="8 7" opacity=".75" />
        </>
      );
    case 'apex-arc':
      return (
        <>
          <path d="M-64 103 C-22 27 31 -1 151 8" {...stroke} stroke={primary} strokeWidth="22" strokeLinecap="round" opacity=".58" />
          <path d="M-62 95 C-17 28 34 9 151 17" {...stroke} stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M-48 111 C-3 47 42 29 151 36" {...stroke} stroke={primary} strokeWidth="2" opacity=".75" />
          <path d="M4 67 L18 47 L39 45" {...stroke} stroke={accent} strokeWidth="3" />
        </>
      );
    case 'split-blocks':
      return (
        <>
          <path d="M-60 2 H62 L39 43 H-60 Z M51 2 H151 V24 H39 Z" fill={primary} opacity=".66" />
          <path d="M-39 51 H51 L28 95 H-39 Z M40 51 H151 V75 H27 Z" fill={accent} opacity=".58" />
          <path d="M-50 45 H78 L89 34 H142" {...stroke} stroke={accent} strokeWidth="2.3" />
        </>
      );
    case 'slash-stack':
      return (
        <>
          <path d="M-42 104 L17 -5 H42 L-17 104 Z M5 104 L64 -5 H78 L19 104 Z M47 104 L106 -5 H115 L56 104 Z" fill={primary} opacity=".67" />
          <path d="M81 104 L140 -5 H151 L92 104 Z" fill={accent} opacity=".78" />
          <path d="M-53 88 H33 M47 19 H142" {...stroke} stroke={accent} strokeWidth="2.2" />
        </>
      );
    case 'diamond':
      return (
        <>
          <path d="M-43 54 L7 5 H57 L8 54 L57 103 H7 Z" fill={primary} opacity=".45" />
          <path d="M36 54 L84 7 H133 L85 54 L133 101 H84 Z" fill={accent} opacity=".35" />
          <path d="M-43 54 L7 5 H57 L8 54 L57 103 H7 Z M36 54 L84 7 H133 L85 54 L133 101 H84 Z" {...stroke} stroke={primary} strokeWidth="2" opacity=".85" />
          <path d="M8 54 H85" {...stroke} stroke={accent} strokeWidth="3" />
        </>
      );
    case 'hexagon':
      return (
        <>
          <path d="M-37 29 L-10 4 H39 L64 29 L37 54 H-12 Z M50 66 L76 41 H127 L151 66 L126 91 H75 Z" fill={primary} opacity=".4" />
          <path d="M-17 77 L8 54 H55 L79 77 L54 101 H7 Z" fill={accent} opacity=".44" />
          <path d="M-37 29 L-10 4 H39 L64 29 L37 54 H-12 Z M50 66 L76 41 H127 L151 66 L126 91 H75 Z M-17 77 L8 54 H55 L79 77 L54 101 H7 Z" {...stroke} stroke={primary} strokeWidth="1.8" />
        </>
      );
    case 'circle-ring':
      return (
        <>
          <path d="M-55 91 A101 101 0 0 1 109 -4" {...stroke} stroke={primary} strokeWidth="18" strokeDasharray="34 8" opacity=".58" />
          <path d="M-42 94 A88 88 0 0 1 111 14" {...stroke} stroke={accent} strokeWidth="3.5" strokeDasharray="14 6" />
          <path d="M-23 91 A69 69 0 0 1 107 35" {...stroke} stroke={primary} strokeWidth="2" opacity=".8" />
          <path d="M66 12 L79 30 M96 22 L103 43 M26 8 L35 29" {...stroke} stroke={accent} strokeWidth="3" />
        </>
      );
    case 'triangle':
      return (
        <>
          <path d="M-47 95 L4 3 L55 95 Z" fill={primary} opacity=".35" />
          <path d="M18 95 L69 3 L120 95 Z" fill={accent} opacity=".3" />
          <path d="M-47 95 L4 3 L55 95 Z M18 95 L69 3 L120 95 Z M80 95 L130 5 L169 76" {...stroke} stroke={primary} strokeWidth="2.1" />
          <path d="M-16 73 H95 L104 57 H144" {...stroke} stroke={accent} strokeWidth="3" />
        </>
      );
    case 'checkered-panel':
      return (
        <>
          <g fill={primary} opacity=".72" transform="skewX(-12)">
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 12 }, (_, column) =>
                (row + column) % 2 === 0 ? (
                  <rect key={`${row}-${column}`} x={-48 + column * 17} y={8 + row * 17} width="17" height="17" />
                ) : null,
              ),
            )}
          </g>
          <path d="M-55 7 H151 M-55 94 H151" {...stroke} stroke={accent} strokeWidth="2.5" opacity=".8" />
        </>
      );
    case 'tech-bracket':
      return (
        <>
          <path d="M-47 28 V7 H21 L33 19 H89 L101 7 H150 V29 H137 V20 H107 L95 32 H27 L15 20 H-34 V28 Z" fill={primary} opacity=".55" />
          <path d="M-47 72 V93 H21 L33 81 H89 L101 93 H150 V71 H137 V80 H107 L95 68 H27 L15 80 H-34 V72 Z" fill={accent} opacity=".48" />
          <path d="M-22 50 H32 L40 42 H91 L99 50 H139" {...stroke} stroke={primary} strokeWidth="2.2" />
        </>
      );
    case 'wave':
      return (
        <>
          <path d="M-61 82 C-15 13 30 96 76 28 C97 -3 121 2 151 26" {...stroke} stroke={primary} strokeWidth="18" strokeLinecap="round" opacity=".55" />
          <path d="M-61 82 C-15 13 30 96 76 28 C97 -3 121 2 151 26" {...stroke} stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M-57 99 C-11 30 35 112 81 45 C103 13 126 18 151 41" {...stroke} stroke={primary} strokeWidth="2" opacity=".7" />
        </>
      );
    case 'starburst':
      return (
        <>
          <path d="M-56 98 L12 43 L-23 97 Z M-42 12 L13 43 L-18 3 Z M29 -8 L13 43 L54 -8 Z M151 10 L13 43 L151 35 Z M151 55 L13 43 L151 88 Z M88 108 L13 43 L52 108 Z" fill={primary} opacity=".53" />
          <path d="M-54 71 L13 43 L-46 57 Z M105 -9 L13 43 L126 -9 Z M151 39 L13 43 L151 50 Z" fill={accent} opacity=".72" />
          <path d="M-40 83 L13 43 L137 18" {...stroke} stroke={accent} strokeWidth="2" />
        </>
      );
    case 'target':
      return (
        <>
          <path d="M-55 74 H-27 L-12 49 L6 83 L26 22 L45 66 L65 42 L83 55 L103 17 L121 74 H151" {...stroke} stroke={primary} strokeWidth="12" strokeLinejoin="bevel" opacity=".5" />
          <path d="M-55 74 H-27 L-12 49 L6 83 L26 22 L45 66 L65 42 L83 55 L103 17 L121 74 H151" {...stroke} stroke={accent} strokeWidth="3" strokeLinejoin="bevel" />
          <path d="M-51 88 H147" {...stroke} stroke={primary} strokeWidth="2" strokeDasharray="15 6" opacity=".75" />
        </>
      );
    case 'wing':
      return (
        <>
          <path d="M-57 72 L16 7 H151 L84 35 H30 L-12 72 Z" fill={primary} opacity=".62" />
          <path d="M-38 91 L35 35 H151 L102 55 H48 L3 91 Z" fill={accent} opacity=".5" />
          <path d="M-48 79 L22 19 H128 M-20 96 L45 45 H151" {...stroke} stroke={primary} strokeWidth="2.2" />
        </>
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
          <stop offset=".08" stopColor="white" stopOpacity=".85" />
          <stop offset=".5" stopColor="white" />
          <stop offset=".92" stopColor="white" stopOpacity=".85" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="graphicBackdropMask">
          <rect x="-70" y="-15" width="230" height="130" fill="url(#graphicBackdropFade)" />
        </mask>
      </defs>
      <g
        data-graphic-element={id}
        data-graphic-role="background-graphic"
        transform={`translate(${x} ${y}) scale(${scaleX} ${scaleY}) translate(-50 -50)`}
        opacity=".55"
        mask="url(#graphicBackdropMask)"
        pointerEvents="none"
      >
        <BackgroundArtwork
          id={id}
          primary={branding.primary}
          accent={branding.accent}
        />
      </g>
    </>
  );
}
