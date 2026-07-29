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
          <path d="M-65 13 H55 L83 38 H-65 Z M-65 47 H96 L126 73 H-65 Z" fill={primary} opacity=".66" />
          <path d="M31 13 H67 L96 38 H60 Z M75 47 H109 L139 73 H105 Z" fill={accent} opacity=".82" />
          <path d="M-48 83 H64 L80 97 H-48 Z M89 83 H151 V97 H105 Z" fill={primary} opacity=".34" />
          <path d="M-54 41 H105 L119 53 H151 M-30 78 H76" {...stroke} stroke={accent} strokeWidth="2.3" opacity=".78" />
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
          <path d="M-59 16 H151 V34 H-59 Z M-59 66 H151 V84 H-59 Z" fill={primary} opacity=".24" />
          <path d="M-43 9 H-18 V42 H-43 Z M8 9 H33 V42 H8 Z M59 9 H84 V42 H59 Z M110 9 H135 V42 H110 Z" fill={primary} opacity=".68" />
          <path d="M-18 58 H8 V91 H-18 Z M33 58 H59 V91 H33 Z M84 58 H110 V91 H84 Z M135 58 H160 V91 H135 Z" fill={accent} opacity=".62" />
          <path d="M-58 50 H38 L50 39 H101 L113 50 H151" {...stroke} stroke={accent} strokeWidth="2.5" />
        </>
      );
    case 'dot-matrix':
      return (
        <>
          <path d="M-57 19 H82 L97 32 H-57 Z M-31 42 H119 L135 56 H-47 Z M-8 67 H151 V82 H-25 Z" fill={primary} opacity=".32" />
          <g fill={primary} opacity=".8">
            {Array.from({ length: 9 }, (_, index) => (
              <rect key={`upper-${index}`} x={-48 + index * 17} y={13} width={index < 6 ? 11 : 6} height="7" />
            ))}
            {Array.from({ length: 11 }, (_, index) => (
              <rect key={`middle-${index}`} x={-38 + index * 16} y={44} width={index % 3 === 0 ? 12 : 7} height="8" />
            ))}
            {Array.from({ length: 8 }, (_, index) => (
              <rect key={`lower-${index}`} x={17 + index * 18} y={72} width={index < 5 ? 12 : 6} height="8" />
            ))}
          </g>
          <path d="M-55 30 H62 L78 44 H151 M-15 61 H104 L117 73 H151" {...stroke} stroke={accent} strokeWidth="2.2" opacity=".9" />
        </>
      );
    case 'crosshair':
      return (
        <>
          <path d="M-59 9 H50 L62 21 H151 V39 H78 L66 27 H-59 Z" fill={primary} opacity=".56" />
          <path d="M-59 62 H9 L24 47 H151 V66 H41 L26 81 H-59 Z" fill={accent} opacity=".54" />
          <path d="M-36 34 H47 L57 44 H113 L123 34 H151 V45 H128 L117 56 H53 L42 45 H-36 Z" fill={primary} opacity=".3" />
          <path d="M-48 87 H18 L28 77 H91 M105 77 H151 M89 14 H126" {...stroke} stroke={accent} strokeWidth="2.4" />
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
          <path d="M-58 15 H36 L58 35 H-58 Z M21 43 H116 L139 64 H-2 Z M76 72 H151 V94 H52 Z" fill={primary} opacity=".54" />
          <path d="M36 15 H65 L87 35 H58 Z M116 43 H145 L168 64 H139 Z M52 72 H82 L106 94 H76 Z" fill={accent} opacity=".72" />
          <path d="M-42 39 H31 L45 52 H103 M18 69 H91 L106 82 H151" {...stroke} stroke={accent} strokeWidth="2.3" opacity=".78" />
        </>
      );
    case 'hexagon':
      return (
        <>
          <path d="M-59 13 H19 L31 25 H83 L95 13 H151 V34 H104 L92 46 H22 L10 34 H-59 Z" fill={primary} opacity=".48" />
          <path d="M-35 60 H30 L42 48 H105 L117 60 H151 V82 H108 L96 70 H51 L39 82 H-35 Z" fill={accent} opacity=".48" />
          <path d="M-51 49 H-7 L3 39 H67 L78 50 H127 L138 39 H151 M-12 91 H54 L65 80 H119" {...stroke} stroke={primary} strokeWidth="2.2" opacity=".86" />
          <path d="M22 20 H78 M48 64 H100" {...stroke} stroke={accent} strokeWidth="3.2" />
        </>
      );
    case 'circle-ring':
      return (
        <>
          <path d="M-58 93 L-33 64 H-12 L7 43 H29 L45 25 H68 L82 10 H151 V32 H94 L79 48 H57 L41 66 H19 L1 86 H-20 L-27 93 Z" fill={primary} opacity=".56" />
          <path d="M-31 93 L-11 71 H10 L29 51 H51 L67 34 H90 L103 20 H151 V30 H108 L94 45 H72 L56 62 H34 L16 82 H-5 L-15 93 Z" fill={accent} opacity=".58" />
          <path d="M-54 78 H-39 L-22 59 H0 L18 39 H40 L55 22 H77 L89 9 H132" {...stroke} stroke={accent} strokeWidth="2.6" />
        </>
      );
    case 'triangle':
      return (
        <>
          <path d="M-61 88 L5 12 H39 L-27 88 Z M18 88 L72 25 H101 L47 88 Z M87 88 L128 40 H151 V67 L133 88 Z" fill={primary} opacity=".52" />
          <path d="M-28 88 L38 12 H51 L-15 88 Z M48 88 L102 25 H114 L60 88 Z" fill={accent} opacity=".76" />
          <path d="M-49 96 H22 L38 78 H94 L109 61 H151 M-43 58 H15 L31 40 H82" {...stroke} stroke={accent} strokeWidth="2.2" opacity=".82" />
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
