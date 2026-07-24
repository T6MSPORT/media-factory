import { Trash2 } from 'lucide-react';
import { Upload } from '../components/forms/ImageUpload';
import { PageHeader } from '../components/ui';
import { id } from '../store';
import type { Data, Sponsor } from '../types';
import { getImageDimensions } from '../utils/images';

type SponsorsPageProps = {
  data: Data;
  setData: (data: Data) => void;
};

export function SponsorsPage({ data, setData }: SponsorsPageProps) {
  const add = () => {
    if (data.sponsors.length >= 10) return;
    setData({
      ...data,
      sponsors: [...data.sponsors, { id: id('sponsor'), name: 'New Sponsor' }],
    });
  };
  const logoScale = data.branding.sponsorLogoScale || 1;

  return (
    <div className="page">
      <PageHeader
        title="Sponsors"
        subtitle={`${data.sponsors.length}/10 logos available for the locked sponsor bar.`}
      />
      <div className="sponsor-toolbar">
        <button
          className="primary inline-action"
          onClick={add}
          disabled={data.sponsors.length >= 10}
        >
          Add sponsor
        </button>
        <label className="sponsor-size-control">
          Logo visual size <span>{Math.round(logoScale * 100)}%</span>
          <input
            type="range"
            min="0.65"
            max="1.4"
            step="0.05"
            value={logoScale}
            onChange={(event) =>
              setData({
                ...data,
                branding: {
                  ...data.branding,
                  sponsorLogoScale: +event.target.value,
                },
              })
            }
          />
        </label>
      </div>
      <p className="field-help">
        Transparent padding is removed automatically when a logo is uploaded. Logo dimensions are
        measured after transparent padding is removed, then each logo is normalised by visible area
        while preserving its proportions.
      </p>
      <div className="stack">
        {data.sponsors.map((sponsor) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            update={(patch) =>
              setData({
                ...data,
                sponsors: data.sponsors.map((item) =>
                  item.id === sponsor.id ? { ...item, ...patch } : item,
                ),
              })
            }
            remove={() =>
              setData({
                ...data,
                sponsors: data.sponsors.filter((item) => item.id !== sponsor.id),
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

type SponsorCardProps = {
  sponsor: Sponsor;
  update: (patch: Partial<Sponsor>) => void;
  remove: () => void;
};

function SponsorCard({ sponsor, update, remove }: SponsorCardProps) {
  const saveLogo = async (logo: string) => {
    try {
      const size = await getImageDimensions(logo);
      update({ logo, logoWidth: size.width, logoHeight: size.height });
    } catch {
      update({ logo, logoWidth: undefined, logoHeight: undefined });
    }
  };

  return (
    <div className="edit-card">
      <div className="brand-mark">
        {sponsor.logo ? <img src={sponsor.logo} /> : sponsor.name.slice(0, 2)}
      </div>
      <div className="form-grid">
        <label>
          Name
          <input
            value={sponsor.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </label>
        <Upload label="Logo" purpose="logo" on={saveLogo} />
      </div>
      <button className="icon danger" onClick={remove}>
        <Trash2 size={17} />
      </button>
    </div>
  );
}
