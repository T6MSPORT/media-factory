import type { FormatId } from '../types';
import { getCanvasDimensions, toSafeFileName } from './format';
import orbitronUrl from '@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2?url';
import oxaniumUrl from '@fontsource-variable/oxanium/files/oxanium-latin-wght-normal.woff2?url';
import tekoUrl from '@fontsource-variable/teko/files/teko-latin-wght-normal.woff2?url';
import rajdhaniRegularUrl from '@fontsource/rajdhani/files/rajdhani-latin-400-normal.woff2?url';
import rajdhaniBoldUrl from '@fontsource/rajdhani/files/rajdhani-latin-700-normal.woff2?url';
import russoOneUrl from '@fontsource/russo-one/files/russo-one-latin-400-normal.woff2?url';

type ExportFontFile = {
  family: string;
  weight: string;
  url: string;
};

export const EXPORT_FONT_FILES: readonly ExportFontFile[] = [
  { family: 'Orbitron', weight: '400 900', url: orbitronUrl },
  { family: 'Oxanium', weight: '200 800', url: oxaniumUrl },
  { family: 'Teko', weight: '300 700', url: tekoUrl },
  { family: 'Rajdhani', weight: '400', url: rajdhaniRegularUrl },
  { family: 'Rajdhani', weight: '700 900', url: rajdhaniBoldUrl },
  { family: 'Russo One', weight: '400 900', url: russoOneUrl },
] as const;

const fontDataCache = new Map<string, Promise<string>>();

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

async function loadFontDataUrl(url: string): Promise<string> {
  let pending = fontDataCache.get(url);
  if (!pending) {
    pending = fetch(url).then(async response => {
      if (!response.ok) {
        throw new Error(`Export font could not be loaded (${response.status}).`);
      }
      return `data:font/woff2;base64,${arrayBufferToBase64(
        await response.arrayBuffer(),
      )}`;
    });
    fontDataCache.set(url, pending);
  }
  return pending;
}

export function getExportFontFiles(svgMarkup: string): readonly ExportFontFile[] {
  return EXPORT_FONT_FILES.filter(font => svgMarkup.includes(font.family));
}

async function serializeSvgWithEmbeddedFonts(
  node: SVGSVGElement,
): Promise<string> {
  const clone = node.cloneNode(true) as SVGSVGElement;
  const markup = new XMLSerializer().serializeToString(clone);
  const fontFiles = getExportFontFiles(markup);

  if (!fontFiles.length) return markup;

  const sources = await Promise.all(
    fontFiles.map(font => loadFontDataUrl(font.url)),
  );
  const css = fontFiles
    .map(
      (font, index) =>
        `@font-face{font-family:'${font.family}';font-style:normal;font-weight:${font.weight};src:url('${sources[index]}') format('woff2');}`,
    )
    .join('');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = css;
  clone.insertBefore(style, clone.firstChild);

  return new XMLSerializer().serializeToString(clone);
}

export type PngExportPlan = {
  width: number;
  height: number;
  fileName: string;
  mimeType: 'image/png';
};

export function getPngExportPlan(
  format: FormatId,
  projectName: string,
): PngExportPlan {
  const { width, height } = getCanvasDimensions(format);
  return {
    width,
    height,
    fileName: `${toSafeFileName(projectName)}.png`,
    mimeType: 'image/png',
  };
}

export async function exportSvgAsPng(
  node: SVGSVGElement,
  format: FormatId,
  projectName: string,
): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    // The browser can still export using its available font fallback.
  }

  const xml = await serializeSvgWithEmbeddedFonts(node);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const plan = getPngExportPlan(format, projectName);
      const canvas = document.createElement('canvas');
      canvas.width = plan.width;
      canvas.height = plan.height;

      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('PNG canvas could not be created.'));
        return;
      }

      context.drawImage(image, 0, 0, plan.width, plan.height);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('PNG data could not be generated.'));
          return;
        }

        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = plan.fileName;
        anchor.click();
        URL.revokeObjectURL(anchor.href);
        resolve();
      }, plan.mimeType);
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('The SVG preview could not be loaded for export.'));
    };

    image.src = svgUrl;
  });
}
