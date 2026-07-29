import { LockKeyhole, UserRound } from 'lucide-react';
import { ProfileAssetCard } from '../components/forms/ProfileAsset';
import { TextField } from '../components/forms/PropertyEditor';
import { PageHeader } from '../components/ui';
import { DRIVER_FIELDS, labelForDriverField } from '../config/profile';
import { updateProfile } from '../state/pageState';
import type { Data, DriverProfile } from '../types';

type ProfilePageProps = {
  data: Data;
  setData: (data: Data) => void;
};

export function ProfilePage({ data, setData }: ProfilePageProps) {
  const profile = data.profile;
  const update = (patch: Partial<DriverProfile>) =>
    setData(updateProfile(data, patch));

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
              <div key={key} className={key === 'name' ? 'locked-profile-field' : ''}>
                <TextField
                  label={labelForDriverField(key)}
                  value={profile[key]}
                  readOnly={key === 'name' && profile.nameLocked}
                  onChange={value => update({ [key]: value })}
                />
                {key === 'name' && profile.nameLocked && (
                  <span className="field-lock-note">
                    <LockKeyhole size={12} /> Locked to this account
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="profile-previews">
          <ProfileAssetCard
            asset="driverImage"
            image={profile.driverImage}
            fallback={<UserRound size={48} />}
            onChange={driverImage => update({ driverImage })}
          />
          <div className="logo-preview-stack">
            <ProfileAssetCard
              asset="teamLogo"
              image={profile.teamLogo}
              onChange={teamLogo => update({ teamLogo })}
              onRemove={() => update({ teamLogo: undefined })}
            />
            <ProfileAssetCard
              asset="competitionLogo"
              image={profile.competitionLogo}
              onChange={competitionLogo => update({ competitionLogo })}
              onRemove={() => update({ competitionLogo: undefined })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
