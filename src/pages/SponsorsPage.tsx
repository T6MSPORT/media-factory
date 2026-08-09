import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Upload } from '../components/forms/ImageUpload';
import { PageHeader } from '../components/ui';
import {
  addSponsor,
  moveSponsor,
  removeSponsor,
  SPONSOR_LIMIT,
  updateSponsor,
} from '../state/pageState';
import type { Data, Sponsor } from '../types';
import { getImageDimensions } from '../utils/images';

type DimensionReader = (
  source: string,
) => Promise<{ width: number; height: number }>;

export async function saveSponsorLogo(
  logo: string,
  update: (patch: Partial<Sponsor>) => void,
  readDimensions: DimensionReader = getImageDimensions,
): Promise<void> {
  const size = await readDimensions(logo);
  update({ logo, logoWidth: size.width, logoHeight: size.height });
}

type SponsorsPageProps = {
  data: Data;
  setData: (data: Data) => void;
};

export function SponsorsPage({ data, setData }: SponsorsPageProps) {
  return (
    <div className="page">
      <PageHeader
        title="Sponsors"
        subtitle={`${data.sponsors.length}/${SPONSOR_LIMIT} logos available for the locked sponsor bar.`}
      />
      <div className="sponsor-toolbar">
        <button
          className="primary inline-action"
          onClick={() => setData(addSponsor(data))}
          disabled={data.sponsors.length >= SPONSOR_LIMIT}
        >
          Add sponsor
        </button>
      </div>
      <p className="field-help">
        Use the arrows to set the order shown in the sponsor bar.{' '}
        Transparent padding is removed automatically when a logo is uploaded. Logo dimensions are
        measured after transparent padding is removed, then each logo is normalised by visible area
        while preserving its proportions.
      </p>
      <div className="stack">
        {data.sponsors.map((sponsor, index) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            index={index}
            sponsorCount={data.sponsors.length}
            update={(patch) =>
              setData(updateSponsor(data, sponsor.id, patch))
            }
            move={(direction) =>
              setData(moveSponsor(data, sponsor.id, direction))
            }
            remove={() =>
              setData(removeSponsor(data, sponsor.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

type SponsorCardProps = {
  sponsor: Sponsor;
  index: number;
  sponsorCount: number;
  update: (patch: Partial<Sponsor>) => void;
  move: (direction: -1 | 1) => void;
  remove: () => void;
};

function SponsorCard({
  sponsor,
  index,
  sponsorCount,
  update,
  move,
  remove,
}: SponsorCardProps) {
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
        <Upload
          label="Logo"
          purpose="logo"
          on={logo => saveSponsorLogo(logo, update)}
        />
      </div>
      <div className="sponsor-order-actions">
        <button
          className="icon"
          aria-label={`Move ${sponsor.name} up`}
          title="Move up"
          disabled={index === 0}
          onClick={() => move(-1)}
        >
          <ArrowUp size={17} />
        </button>
        <button
          className="icon"
          aria-label={`Move ${sponsor.name} down`}
          title="Move down"
          disabled={index === sponsorCount - 1}
          onClick={() => move(1)}
        >
          <ArrowDown size={17} />
        </button>
        <button
          className="icon danger"
          aria-label={`Remove ${sponsor.name}`}
          title="Remove sponsor"
          onClick={remove}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
