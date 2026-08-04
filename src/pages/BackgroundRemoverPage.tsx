import { useEffect, useState } from 'react';
import { Download, Eraser, ImagePlus, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/ui';
import {
  backgroundRemovalFileName,
  removeImageBackground,
} from '../utils/backgroundRemoval';

type RemovalState = 'idle' | 'processing' | 'complete' | 'error';

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
        title="Background remover"
        subtitle="Remove an image background and download a transparent PNG ready for your graphics."
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
              <span>Background removed</span>
              <div className="background-remover-canvas transparent">
                {resultUrl ? (
                  <img src={resultUrl} alt="Transparent background result" />
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
                onClick={() => downloadRemovedBackground(result, file.name)}
              >
                <Download size={17} /> Download transparent PNG
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
