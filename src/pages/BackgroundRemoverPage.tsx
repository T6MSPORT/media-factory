import { useEffect, useState } from 'react';
import { Download, Eraser, ImagePlus, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '../components/ui';
import {
  backgroundRemovalFileName,
  removeImageBackground,
} from '../utils/backgroundRemoval';

type RemovalState = 'idle' | 'processing' | 'complete' | 'error';
type ImageFilter = 'none' | 'black-and-white' | 'sepia' | 'high-contrast';

export const IMAGE_FILTERS: Record<ImageFilter, { label: string; css: string }> = {
  none: { label: 'Original colour', css: 'none' },
  'black-and-white': { label: 'Black and white', css: 'grayscale(1)' },
  sepia: { label: 'Sepia', css: 'sepia(1)' },
  'high-contrast': { label: 'High contrast', css: 'contrast(1.45) saturate(1.15)' },
};

export async function applyImageFilter(blob: Blob, filter: ImageFilter): Promise<Blob> {
  if (filter === 'none') return blob;
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
    context.filter = IMAGE_FILTERS[filter].css;
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(output => output ? resolve(output) : reject(new Error('The edited PNG could not be created.')), 'image/png'),
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
  const [filter, setFilter] = useState<ImageFilter>('none');

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const reset = () => {
    setFile(undefined);
    setSourceUrl('');
    setResult(undefined);
    setResultUrl('');
    setProgress(0);
    setState('idle');
    setError('');
    setFilter('none');
  };

  const process = async (selected: File) => {
    setFile(selected);
    setSourceUrl(URL.createObjectURL(selected));
    setResult(undefined);
    setResultUrl('');
    setProgress(0);
    setState('processing');
    setError('');

    try {
      const output = await removeImageBackground(selected, setProgress);
      setResult(output);
      setResultUrl(URL.createObjectURL(output));
      setProgress(100);
      setState('complete');
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'The background could not be removed. Please try another image.',
      );
      setState('error');
    }
  };

  return (
    <div className="page background-remover-page">
      <PageHeader
        title="Image editor"
        subtitle="Remove backgrounds, apply image filters and download a transparent PNG ready for your graphics."
      />

      {!file ? (
        <label className="background-remover-dropzone">
          <span className="background-remover-icon"><Eraser size={34} /></span>
          <strong>Choose an image</strong>
          <p>Upload a driver, car or product image in JPEG, PNG or WebP format.</p>
          <span className="primary"><ImagePlus size={17} /> Upload image</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={event => {
              const selected = event.target.files?.[0];
              if (selected) void process(selected);
              event.currentTarget.value = '';
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
              <span>Edited image</span>
              <div className="background-remover-canvas transparent">
                {resultUrl ? (
                  <img src={resultUrl} alt="Edited transparent result" style={{ filter: IMAGE_FILTERS[filter].css }} />
                ) : (
                  <div className="background-remover-status">
                    {state === 'error' ? <Eraser size={30} /> : <span>{progress}%</span>}
                    <strong>{state === 'error' ? 'Removal failed' : 'Removing background…'}</strong>
                    {state === 'processing' && (
                      <div className="background-remover-progress">
                        <i style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {error && <p className="background-remover-error">{error}</p>}
          {state === 'processing' && progress < 100 && (
            <p className="background-remover-note">
              The removal model downloads on first use and is then cached by your browser.
            </p>
          )}

          {result && (
            <section className="image-filter-panel">
              <div><SlidersHorizontal size={18} /><strong>Image filters</strong></div>
              <label>
                Filter
                <select value={filter} onChange={event => setFilter(event.target.value as ImageFilter)}>
                  {(Object.entries(IMAGE_FILTERS) as Array<[ImageFilter, { label: string; css: string }]>).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </section>
          )}

          <div className="background-remover-actions">
            <button type="button" className="icon" onClick={reset}>
              <RotateCcw size={17} /> Start again
            </button>
            {state === 'error' && file && (
              <button type="button" className="primary" onClick={() => void process(file)}>
                <Eraser size={17} /> Try again
              </button>
            )}
            {result && file && (
              <button
                type="button"
                className="primary"
                onClick={async () => downloadRemovedBackground(await applyImageFilter(result, filter), file.name)}
              >
                <Download size={17} /> Download edited PNG
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
