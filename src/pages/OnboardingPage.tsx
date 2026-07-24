import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { Upload } from '../components/forms/ImageUpload';
import { DRIVER_FIELDS, labelForDriverField } from '../config/profile';
import type { Data } from '../types';

type OnboardingPageProps = {
  data: Data;
  finish: (data: Data) => void;
};

export function OnboardingPage({ data, finish }: OnboardingPageProps) {
  const [draft, setDraft] = useState(data);
  const profile = draft.profile;
  const valid = profile.name.trim() && profile.number.trim();

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <div className="logo large">
          <span>MF</span>
          <div>
            <b>MEDIA FACTORY</b>
            <small>DRIVER GRAPHICS</small>
          </div>
        </div>
        <span className="eyebrow">WELCOME</span>
        <h1>Create your driver profile</h1>
        <p>
          Your profile supplies the permanent details and assets used across your templates. Hero
          images are selected separately for each graphic.
        </p>
        <div className="onboarding-grid">
          <div className="portrait-upload">
            {profile.driverImage ? <img src={profile.driverImage} /> : <UserRound size={54} />}
            <Upload
              label="Driver image"
              purpose="portrait"
              on={driverImage =>
                setDraft({ ...draft, profile: { ...profile, driverImage } })
              }
            />
          </div>
          <div className="form-grid single">
            {DRIVER_FIELDS.map(field => (
              <label key={field}>
                {labelForDriverField(field)}
                <input
                  value={profile[field]}
                  onChange={event =>
                    setDraft({
                      ...draft,
                      profile: { ...profile, [field]: event.target.value },
                    })
                  }
                />
              </label>
            ))}
            <Upload
              label="Team logo"
              purpose="logo"
              on={teamLogo => setDraft({ ...draft, profile: { ...profile, teamLogo } })}
            />
            <Upload
              label="Competition logo"
              purpose="logo"
              on={competitionLogo =>
                setDraft({ ...draft, profile: { ...profile, competitionLogo } })
              }
            />
          </div>
        </div>
        <button className="primary wide" disabled={!valid} onClick={() => finish(draft)}>
          Create profile
        </button>
      </div>
    </div>
  );
}
