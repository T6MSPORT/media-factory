import { PageHeader } from '../components/ui';
import { MOTORSPORT_FONTS } from '../config/branding';
import type { Branding, Data } from '../types';

type BrandingPageProps = {
  data: Data;
  setData: (data: Data) => void;
};

export function BrandingPage({ data, setData }: BrandingPageProps) {
  const branding = data.branding;
  const profile = data.profile;
  const update = (patch: Partial<Branding>) =>
    setData({ ...data, branding: { ...branding, ...patch } });

  return (
    <div className="page">
      <PageHeader
        title="Branding"
        subtitle="Set your preferred colours and fonts and review them in a contained template preview."
      />
      <div className="branding-layout">
        <div className="panel">
          <div className="form-grid">
            <label>
              Primary colour
              <input
                type="color"
                value={branding.primary}
                onChange={(event) => update({ primary: event.target.value })}
              />
            </label>
            <label>
              Secondary colour
              <input
                type="color"
                value={branding.secondary}
                onChange={(event) => update({ secondary: event.target.value })}
              />
            </label>
            <label>
              Accent colour
              <input
                type="color"
                value={branding.accent}
                onChange={(event) => update({ accent: event.target.value })}
              />
            </label>
            <label>
              Heading font
              <select
                value={branding.headingFont}
                onChange={(event) => update({ headingFont: event.target.value })}
              >
                {MOTORSPORT_FONTS.map((font) => (
                  <option key={font}>{font}</option>
                ))}
              </select>
            </label>
            <label>
              Body font
              <select
                value={branding.bodyFont}
                onChange={(event) => update({ bodyFont: event.target.value })}
              >
                {MOTORSPORT_FONTS.map((font) => (
                  <option key={font}>{font}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="branding-preview-shell">
          <div
            className="branding-preview-window"
            style={{ background: `linear-gradient(145deg,${branding.secondary},#050607)` }}
          >
            <div className="preview-stripe" style={{ background: branding.primary }} />
            <div className="preview-copy" style={{ color: branding.accent }}>
              <small style={{ fontFamily: branding.bodyFont }}>
                #{profile.number || '00'} · {profile.team || 'YOUR TEAM'}
              </small>
              <strong style={{ fontFamily: branding.headingFont }}>RACE WEEKEND</strong>
              <span style={{ fontFamily: branding.bodyFont }}>BRAND PREVIEW</span>
            </div>
            <div className="preview-logos">
              {profile.competitionLogo ? <img src={profile.competitionLogo} /> : <div>COMP</div>}
              {profile.teamLogo ? <img src={profile.teamLogo} /> : <div>TEAM</div>}
            </div>
            <div className="preview-sponsor-bar">SPONSOR BAR · 5 PER ROW</div>
          </div>
        </div>
      </div>
    </div>
  );
}
