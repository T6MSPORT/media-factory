import { useEffect, useState } from 'react';
import { Download, Images, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { cloudExportUrl, deleteCloudExport } from '../services/cloudExports';
import type { Data } from '../types';
import { formatSavedGraphicDate } from '../utils/format';

type ExportsPageProps = { data: Data; setData: (data: Data) => void };

export function ExportsPage({ data, setData }: ExportsPageProps) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void Promise.all(data.exports.map(async item => [item.id, await cloudExportUrl(item.storagePath)] as const))
      .then(entries => { if (!cancelled) setUrls(Object.fromEntries(entries)); })
      .catch(() => { if (!cancelled) setError('Some export previews could not be loaded.'); });
    return () => { cancelled = true; };
  }, [data.exports]);

  return (
    <div className="page">
      <PageHeader title="Exports" subtitle="Download or remove PNG copies you previously exported." />
      {error && <p className="field-help" role="alert">{error}</p>}
      {data.exports.length === 0 ? (
        <div className="empty">
          <Images size={42} />
          <h3>No exports yet</h3>
          <p>PNG copies appear here automatically after export.</p>
        </div>
      ) : (
        <div className="project-grid export-grid">
          {data.exports.map(item => (
            <article className="project-card export-card" key={item.id}>
              <div className="export-preview">
                {urls[item.id] ? <img src={urls[item.id]} alt="" /> : <Images size={30} />}
              </div>
              <h3>{item.projectName}</h3>
              <small>Exported {formatSavedGraphicDate(item.createdAt)}</small>
              <div>
                <a className="export-download" href={urls[item.id]} download={item.fileName}>
                  <Download size={16} /> Download again
                </a>
                <button
                  className="icon danger"
                  aria-label={`Delete ${item.fileName}`}
                  onClick={async () => {
                    if (!window.confirm(`Delete "${item.fileName}" from Exports?`)) return;
                    try {
                      await deleteCloudExport(item.storagePath);
                      setData({ ...data, exports: data.exports.filter(value => value.id !== item.id) });
                    } catch (reason) {
                      setError(reason instanceof Error ? reason.message : 'This export could not be deleted.');
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
