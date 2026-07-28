import type { ReactNode } from 'react';
import { PROFILE_ASSETS, type ProfileAssetKey } from '../../config/assets';
import { Upload } from './ImageUpload';

type ProfileAssetUploadProps = {
  asset: ProfileAssetKey;
  onChange: (value: string) => void;
};

export function ProfileAssetUpload({ asset, onChange }: ProfileAssetUploadProps) {
  const config = PROFILE_ASSETS[asset];
  return (
    <Upload
      label={config.label}
      purpose={config.purpose}
      on={onChange}
    />
  );
}

type ProfileAssetCardProps = ProfileAssetUploadProps & {
  image?: string;
  fallback?: ReactNode;
  onRemove?: () => void;
};

export function ProfileAssetCard({
  asset,
  image,
  fallback,
  onChange,
  onRemove,
}: ProfileAssetCardProps) {
  const config = PROFILE_ASSETS[asset];
  const driverClass = asset === 'driverImage' ? ' driver-asset-preview' : '';

  return (
    <div className={`asset-preview-card${driverClass}`}>
      <div className="asset-preview-image">
        {image ? <img src={image} /> : fallback || <span>{config.fallback}</span>}
      </div>
      <ProfileAssetUpload asset={asset} onChange={onChange} />
      {image && onRemove && (
        <button type="button" className="asset-remove" onClick={onRemove}>
          Remove {config.label.toLowerCase()}
        </button>
      )}
    </div>
  );
}
