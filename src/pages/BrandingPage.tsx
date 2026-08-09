import { PageHeader } from '../components/ui';
import { GraphicScene } from '../components/builder/GraphicScene';
import { MOTORSPORT_FONTS } from '../config/branding';
import { createProject } from '../state/mediaFactoryState';
import { updateBranding } from '../state/pageState';
import type { Branding, Data } from '../types';

type BrandingPageProps = {
  data: Data;
  setData: (data: Data) => void;
};

export function BrandingPage({ data, setData }: BrandingPageProps) {
  const branding = data.branding;
  const update = (patch: Partial<Branding>) =>
    setData(updateBranding(data, patch));
  const previewProject = createProject('event', data, {
    createId: () => 'branding-preview',
    now: () => '2026-01-01T00:00:00.000Z',
  });

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
          <div className="branding-preview-window">
            <svg
              viewBox="0 0 1080 1350"
              xmlns="http://www.w3.org/2000/svg"
              className="graphic"
            >
              <GraphicScene
              w={1080}
              h={1350}
              project={previewProject}
              data={data}
              sponsors={data.sponsors.slice(0, 10)}
              loadedHeroSize={null}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
