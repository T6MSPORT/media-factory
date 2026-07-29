import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { StorageIssue } from '../store';

type StorageRecoveryProps = {
  issue?: StorageIssue;
  retry: () => void;
};

export function StorageRecovery({ issue, retry }: StorageRecoveryProps) {
  if (!issue) return null;

  const isLoadFailure = issue.operation === 'load';

  return (
    <div className="storage-recovery" role="alert">
      <AlertTriangle size={18} />
      <div>
        <strong>
          {isLoadFailure ? 'Saved data could not be loaded' : 'Changes are not being saved'}
        </strong>
        <span>
          {isLoadFailure
            ? 'Your existing browser data has not been overwritten.'
            : 'Your latest changes are still open. Keep this tab open and retry.'}
        </span>
      </div>
      <button type="button" onClick={retry}>
        <RefreshCw size={15} />
        Retry
      </button>
    </div>
  );
}
