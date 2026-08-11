import { useRef, useState } from 'react';
import { ChevronLeft, Download, Image, Layers3, RotateCcw, SlidersHorizontal, UserRound } from 'lucide-react';
import { useBackgroundDrag } from '../../hooks/useBackgroundDrag';
import type { Data, Project } from '../../types';
import { downloadPngResult, exportSvgAsPng } from '../../utils/export';
import { getImageDimensions } from '../../utils/images';
import { BackgroundUpload } from '../forms/ImageUpload';
import {
  RangeField,
  SelectField,
  ToggleField,
} from '../forms/PropertyEditor';
import {
  centreBackgroundPatch,
  exportProjectPng,
  getUploadedHeroPatch,
  removeBackgroundHeroPatch,
  resetBackgroundPatch,
  resetDriverPatch,
  zoomBackgroundToFillPatch,
} from './builderInteractions';
import { Graphic } from './Graphic';
import { GRAPHIC_ELEMENTS } from './GraphicElements';
import { TemplateFields } from './TemplateFields';

type BuilderProps = {
  data: Data;
  project: Project;
  patch: (patch: Partial<Project>) => void;
  backgroundGraphicLocked: boolean;
  setBackgroundGraphicLocked: (locked: boolean) => void;
  applyBackgroundGraphicToAll: () => void;
  back: () => void;
  archiveExport: (project: Project, result: Awaited<ReturnType<typeof exportSvgAsPng>>) => Promise<void>;
  resetTemplate: () => void;
};

export function Builder({
  data,
  project,
  patch,
  backgroundGraphicLocked,
  setBackgroundGraphicLocked,
  applyBackgroundGraphicToAll,
  back,
  archiveExport,
  resetTemplate,
}: BuilderProps) {
  const [mobileSection, setMobileSection] = useState<'details' | 'design' | 'background' | 'driver'>('details');
  const svg = useRef<SVGSVGElement>(null);
  const backgroundDrag = useBackgroundDrag(svg, project, patch);
  const sponsors = data.sponsors.slice(0, 10);
  const scheduleDaysComplete =
    project.template !== 'schedule' ||
    (project.details.scheduleDays
      ?.slice(0, project.details.scheduleDayCount || 1)
      .every(day => Boolean(day.day)) ??
      false);

  const setDetails = (details: Partial<Project['details']>) =>
    patch({ details: { ...project.details, ...details } });

  const exportPng = async () => {
    if (!svg.current) return;
    const result = await exportProjectPng(svg.current, project, exportSvgAsPng);
    if (!result) return;
    try {
      await archiveExport(project, result);
    } finally {
      downloadPngResult(result);
    }
  };

  return (
    <div className="builder">
      <div className="builder-top">
        <button className="back" onClick={back}>
          <ChevronLeft />
          Templates
        </button>
        <input value={project.name} onChange={event => patch({ name: event.target.value })} />
        <div className="builder-top-actions">
          <button
            onClick={exportPng}
            className="primary"
            disabled={!scheduleDaysComplete}
            title={
              scheduleDaysComplete
                ? undefined
                : 'Select a day for every schedule section before exporting'
            }
          >
            <Download size={18} />
            Export PNG
          </button>
        </div>
      </div>
      <div className="builder-body">
        <section className="controls">
          <div className="mobile-control-nav" aria-label="Editor controls">
            <button className={mobileSection === 'details' ? 'active' : ''} onClick={() => setMobileSection('details')}>
              <SlidersHorizontal size={17} /> Details
            </button>
            <button className={mobileSection === 'design' ? 'active' : ''} onClick={() => setMobileSection('design')}>
              <Layers3 size={17} /> Design
            </button>
            <button className={mobileSection === 'background' ? 'active' : ''} onClick={() => setMobileSection('background')}>
              <Image size={17} /> Background
            </button>
            <button className={mobileSection === 'driver' ? 'active' : ''} onClick={() => setMobileSection('driver')}>
              <UserRound size={17} /> Driver
            </button>
          </div>
          <div className="control-column control-column-primary">
          <div className={`control-section ${mobileSection === 'details' ? 'mobile-active' : ''}`}>
          <h3>Graphic details</h3>
          <label className="mobile-project-name">
            Design name
            <input value={project.name} onChange={event => patch({ name: event.target.value })} />
          </label>
          <SelectField
            label="Format"
            value={project.format}
            onChange={format => patch({ format })}
          >
            <option value="feed">Feed · 1080×1350</option>
            <option value="story">Story · 1080×1920</option>
            <option value="square">Square · 1080×1080</option>
            <option value="custom">Custom dimensions</option>
          </SelectField>
          {project.format === 'custom' && (
            <div className="custom-dimensions">
              <label>
                Width (px)
                <input
                  type="number"
                  min="320"
                  max="4096"
                  value={project.customWidth || 1080}
                  onChange={event => patch({ customWidth: Number(event.target.value) })}
                />
              </label>
              <label>
                Height (px)
                <input
                  type="number"
                  min="320"
                  max="4096"
                  value={project.customHeight || 1080}
                  onChange={event => patch({ customHeight: Number(event.target.value) })}
                />
              </label>
            </div>
          )}
          <TemplateFields
            project={project}
            sponsors={data.sponsors}
            setDetails={setDetails}
          />
{project.template !== 'sponsor' && (
<SelectField
  label="Main text alignment"
  value={project.textAlignment || 'left'}
  onChange={textAlignment =>
    patch({ textAlignment: textAlignment as 'left' | 'right' })
  }
>
  <option value="left">Left</option>
  <option value="right">Right</option>
</SelectField>
)}
          </div>
          <div className={`control-section ${mobileSection === 'design' ? 'mobile-active' : ''}`}>
          <h3>Background graphic</h3>
          <ToggleField
            label="Lock across templates"
            checked={backgroundGraphicLocked}
            onChange={setBackgroundGraphicLocked}
          />
          <p className="control-hint">
            {backgroundGraphicLocked
              ? 'Changes apply to templates using the same layout shape.'
              : 'Unlocked changes apply to this template only.'}
          </p>
          <SelectField
            label="Design"
            value={project.graphicElement || 'none'}
            onChange={graphicElement => patch({ graphicElement })}
          >
            <option value="none">None</option>
            {GRAPHIC_ELEMENTS.map(element => (
              <option key={element.id} value={element.id}>
                {element.name}
              </option>
            ))}
          </SelectField>
          {(project.graphicElement || 'none') !== 'none' && (
            <>
              <RangeField
                label="Move left / right"
                min={0}
                max={100}
                value={project.graphicElementX ?? 50}
                onChange={graphicElementX => patch({ graphicElementX })}
              />
              <RangeField
                label="Move up / down"
                min={0}
                max={100}
                value={project.graphicElementY ?? 55}
                onChange={graphicElementY => patch({ graphicElementY })}
              />
              <RangeField
                label="Graphic size"
                min={10}
                max={200}
                value={project.graphicElementSize ?? 45}
                onChange={graphicElementSize => patch({ graphicElementSize })}
              />
              <button
                onClick={() =>
                  patch({
                    graphicElementX: 50,
                    graphicElementY: 55,
                    graphicElementSize: 45,
                  })
                }
              >
                Reset background graphic
              </button>
            </>
          )}
          {!backgroundGraphicLocked && (
            <button onClick={applyBackgroundGraphicToAll}>
              Apply to templates using this layout shape
            </button>
          )}

          </div>
          </div>
          <div className="control-column control-column-secondary">
          <div className={`control-section background-control-section ${mobileSection === 'background' ? 'mobile-active' : ''}`}>
          <h3>Background hero image</h3>
          <BackgroundUpload
            on={async heroImage => {
              const size = await getImageDimensions(heroImage);
              patch(getUploadedHeroPatch(heroImage, size));
            }}
          />
          {project.heroImage && (
            <>
              <div className="selected-hero">
                <img src={project.heroImage} />
                <span>Background for this graphic only</span>
              </div>
              <button
                className="asset-remove"
                onClick={() => patch(removeBackgroundHeroPatch)}
              >
                Remove background image
              </button>
            </>
          )}
          <div className="background-slider-controls">
          <RangeField
            label="Move left / right"
            min={-500}
            max={500}
            value={project.heroX}
            onChange={heroX => patch({ heroX })}
          />
          <RangeField
            label="Move up / down"
            min={-700}
            max={700}
            value={project.heroY}
            onChange={heroY => patch({ heroY })}
          />
          <RangeField
            label="Background scale"
            min={1}
            max={2.5}
            step={0.05}
            value={project.heroScale}
            onChange={heroScale => patch({ heroScale })}
          />
          </div>
          <RangeField
            label="Black overlay opacity"
            min={0}
            max={100}
            step={1}
            value={project.heroOverlayOpacity ?? 0}
            onChange={heroOverlayOpacity => patch({ heroOverlayOpacity })}
          />
          <div className="control-actions">
            <button onClick={() => patch(centreBackgroundPatch)}>Centre</button>
            <button onClick={() => patch(zoomBackgroundToFillPatch)}>
              Zoom to fill
            </button>
            <button onClick={() => patch(resetBackgroundPatch)}>
              Reset
            </button>
          </div>
          <p className="control-hint">
            Drag directly on the preview to reposition the background.
          </p>

          </div>
          <div className={`control-section driver-control-section ${mobileSection === 'driver' ? 'mobile-active' : ''}`}>
          <h3>Driver image</h3>
          {data.profile.driverImage ? (
            <>
              <div className="selected-driver">
                <img src={data.profile.driverImage} alt="Current driver" />
                <span>Current driver image</span>
              </div>
              <ToggleField
                label="Show driver image"
                checked={project.driverVisible !== false}
                onChange={driverVisible => patch({ driverVisible })}
              />
              {project.driverVisible !== false && <>
              <RangeField
                label="Move left / right"
                min={-500}
                max={500}
                value={project.driverX}
                onChange={driverX => patch({ driverX })}
              />
              <RangeField
                label="Move up / down"
                min={-700}
                max={700}
                value={project.driverY}
                onChange={driverY => patch({ driverY })}
              />
              <RangeField
                label="Driver scale"
                min={0.5}
                max={2.5}
                step={0.05}
                value={project.driverScale}
                onChange={driverScale => patch({ driverScale })}
              />
              <RangeField
                label="Black overlay opacity"
                min={0}
                max={100}
                step={1}
                value={project.driverOverlayOpacity ?? 0}
                onChange={driverOverlayOpacity => patch({ driverOverlayOpacity })}
              />
              <button onClick={() => patch(resetDriverPatch)}>
                Reset driver image
              </button>
              </>}
            </>
          ) : (
            <p className="control-hint">Add your driver image on the Profile page to enable these controls.</p>
          )}
          </div>
          </div>
          <button
            type="button"
            className="reset-template"
            onClick={() => {
              if (window.confirm('Reset this template to the Media Factory default?')) resetTemplate();
            }}
          >
            <RotateCcw size={16} /> Reset template to default
          </button>
        </section>
        <section className="preview">
          {project.heroImage && (
            <div className="mobile-gesture-hint">Drag to reposition · Pinch to zoom</div>
          )}
          <Graphic
            ref={svg}
            project={project}
            data={data}
            sponsors={sponsors}
            onBackgroundPointerDown={backgroundDrag.onPointerDown}
            onBackgroundPointerMove={backgroundDrag.onPointerMove}
            onBackgroundPointerUp={backgroundDrag.onPointerUp}
          />
        </section>
      </div>
    </div>
  );
}
