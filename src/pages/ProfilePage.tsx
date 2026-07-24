import { UserRound } from 'lucide-react';
import { Upload } from '../components/forms/ImageUpload';
import { PageHeader } from '../components/ui';
import { DRIVER_FIELDS, labelForDriverField } from '../config/profile';
import type { Data, DriverProfile } from '../types';

type ProfilePageProps = {
  data: Data;
  setData: (data: Data) => void;
};

export function ProfilePage({ data, setData }: ProfilePageProps) {
  const profile = data.profile;
  const update = (patch: Partial<DriverProfile>) =>
    setData({ ...data, profile: { ...profile, ...patch } });

  return (
    <div className="page">
      <PageHeader
        title="Driver profile"
        subtitle="Your permanent driver details, portrait and logos are reused across relevant templates."
      />
      <div className="profile-layout stacked">
        <div className="panel profile-inputs">
          <div className="form-grid">
            {DRIVER_FIELDS.map((key) => (
              <label key={key}>
                {labelForDriverField(key)}
                <input
                  value={profile[key]}
                  onChange={(event) => update({ [key]: event.target.value })}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="profile-previews">
          <AssetUploadPreview
            title="Driver image"
            image={profile.driverImage}
            fallback={<UserRound size={48} />}
            on={(driverImage) => update({ driverImage })}
          />
          <div className="logo-preview-stack">
            <AssetUploadPreview
              title="Team logo"
              image={profile.teamLogo}
              fallback={<span>TEAM</span>}
              on={(teamLogo) => update({ teamLogo })}
            />
            <AssetUploadPreview
              title="Competition logo"
              image={profile.competitionLogo}
              fallback={<span>COMP</span>}
              on={(competitionLogo) => update({ competitionLogo })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type AssetUploadPreviewProps = {
  title: string;
  image?: string;
  fallback: React.ReactNode;
  on: (value: string) => void;
};

function AssetUploadPreview({ title, image, fallback, on }: AssetUploadPreviewProps) {
  return (
    <div className={`asset-preview-card ${title === 'Driver image' ? 'driver-asset-preview' : ''}`}>
      <div className="asset-preview-image">{image ? <img src={image} /> : fallback}</div>
      <Upload
        label={title}
        purpose={title.toLowerCase().includes('logo') ? 'logo' : 'portrait'}
        on={on}
      />
    </div>
  );
}
