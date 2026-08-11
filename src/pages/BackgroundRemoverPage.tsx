import { useEffect, useState } from 'react';
import { Download, Eraser, ImagePlus, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { backgroundRemovalFileName, removeImageBackground } from '../utils/backgroundRemoval';

type RemovalState = 'idle' | 'processing' | 'complete' | 'error';
type ImageFilter = 'none' | 'black-and-white' | 'sepia' | 'high-contrast';
type FilterSettings = {
  preset: ImageFilter;
  brightness: number;
  contrast: number;
  saturation: number;
};

const DEFAULT_FILTERS: FilterSettings = {
  preset: 'none',
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

export const IMAGE_FILTERS: Record<ImageFilter, { label: string; css: string }> = {
  none: { label: 'Original colour', css: '' },
  'black-and-white': { label: 'Black and white', css: 'grayscale(1)' },
  sepia: { label: 'Sepia', css: 'sepia(1)' },
  'high-contrast': { label: 'High contrast', css: 'contrast(1.45) saturate(1.15)' },
};

export function imageFilterCss(settings: FilterSettings): string {
  return [
    IMAGE_FILTERS[settings.preset].css,
    `brightness(${settings.brightness}%)`,
    `contrast(${settings.contrast}%)`,
    `saturate(${settings.saturation}%)`,
  ].filter(Boolean).join(' ');
}

export async function applyImageFilter(blob: Blob, settings: FilterSettings): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('The edited image could not be prepared.'));
      element.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image filters are unavailable in this browser.');
    context.filter = imageFilterCss(settings);
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        output => output ? resolve(output) : reject(new Error('The edited PNG could not be created.')),
        'image/png',
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadRemovedBackground(blob: Blob, originalName: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = backgroundRemovalFileName(originalName);
  link.click();
  URL.revokeObjectURL(link.href);
}

export function BackgroundRemoverPage() {
  const [file, setFile] = useState<File>();
  const [sourceUrl, setSourceUrl] = useState('');
  const [result, setResult] = useState<Blob>();
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<RemovalState>('idle');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);
  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  const reset = () => {
    setFile(undefined);
    setSourceUrl('');
    setResult(undefined);
    setResultUrl('');
    setProgress(0);
    setState('idle');
    setError('');
    setFilters(DEFAULT_FILTERS);
  };

  const selectImage = (selected: File) => {
    setFile(selected);
    setSourceUrl(URL.createObjectURL(selected));
    setResult(undefined);
    setResultUrl('');
    setProgress(0);
    setState('idle');
    setError('');
  };

  const removeBackground = async () => {
    if (!file) return;
    setProgress(0);
    setState('processing');
    setError('');
    try {
      const output = await removeImageBackground(file, setProgress);
      setResult(output);
      setResultUrl(URL.createObjectURL(output));
      setProgress(100);
      setState('complete');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The background could not be removed.');
      setState('error');
    }
  };

  const previewUrl = resultUrl || sourceUrl;

  return (
    <div className="page background-remover-page">
      <PageHeader
        title="Image editor"
        subtitle="Apply filters to any image, optionally remove its background, and download the edited PNG."
      />

      {!file ? (
        <label className="background-remover-dropzone">
          <span className="background-remover-icon"><SlidersHorizontal size={34} /></span>
          <strong>Choose an image</strong>
          <p>Upload a driver, car or product image in JPEG, PNG or WebP format.</p>
          <span className="primary"><ImagePlus size={17} /> Upload image</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={event => {
              const input = event.currentTarget;
              const selected = input.files?.[0];
              if (selected) selectImage(selected);
              input.value = '';
            }}
          />
        </label>
      ) : (
        <>
          <div className="background-remover-previews">
            <section className="background-remover-card">
              <span>Original</span>
              <div className="background-remover-canvas original">
                <img src={sourceUrl} alt="Original upload" />
              </div>
            </section>
            <section className="background-remover-card">
              <span>{result ? 'Background removed + filters' : 'Filtered image'}</span>
              <div className={`background-remover-canvas ${result ? 'transparent' : 'original'}`}>
                <img src={previewUrl} alt="Edited result" style={{ filter: imageFilterCss(filters) }} />
                {state === 'processing' && (
                  <div className="background-remover-status editor-processing">
                    <span>{progress}%</span>
                    <strong>Removing background…</strong>
                    <div className="background-remover-progress"><i style={{ width: `${progress}%` }} /></div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {error && <p className="background-remover-error">{error}</p>}
          {state === 'processing' && progress < 100 && (
            <p className="background-remover-note">The removal model downloads on first use and is then cached.</p>
          )}

          <section className="image-filter-panel">
            <div><SlidersHorizontal size={18} /><strong>Image filters</strong></div>
            <label>
              Preset
              <select value={filters.preset} onChange={event => setFilters(current => ({ ...current, preset: event.target.value as ImageFilter }))}>
                {(Object.entries(IMAGE_FILTERS) as Array<[ImageFilter, { label: string; css: string }]>).map(([value, option]) => (
                  <option key={value} value={value}>{option.label}</option>
                ))}
              </select>
            </label>
            {(['brightness', 'contrast', 'saturation'] as const).map(key => (
              <label key={key}>
                <span className="field-label-row"><span>{key}</span><span>{filters[key]}%</span></span>
                <input type="range" min="0" max="200" value={filters[key]} onChange={event => setFilters(current => ({ ...current, [key]: Number(event.target.value) }))} />
              </label>
            ))}
            <button type="button" className="icon" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
          </section>

          <div className="background-remover-actions">
            <button type="button" className="icon" onClick={reset}><RotateCcw size={17} /> Start again</button>
            {state !== 'processing' && (
              <button type="button" className="icon" onClick={() => void removeBackground()}>
                <Eraser size={17} /> {state === 'error' ? 'Try removal again' : result ? 'Remove background again' : 'Remove background'}
              </button>
            )}
            <button
              type="button"
              className="primary"
              onClick={async () => downloadRemovedBackground(await applyImageFilter(result || file, filters), file.name)}
            >
              <Download size={17} /> Download edited PNG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
