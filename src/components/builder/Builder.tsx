import { useRef } from 'react';
import { ChevronLeft, Download, Settings2 } from 'lucide-react';
import { useBackgroundDrag } from '../../hooks/useBackgroundDrag';
import type { Data, Project } from '../../types';
import { exportSvgAsPng } from '../../utils/export';
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
  resetBackgroundPatch,
  resetDriverPatch,
  zoomBackgroundToFillPatch,
} from './builderInteractions';
import { Graphic } from './Graphic';
import { TemplateFields } from './TemplateFields';

type BuilderProps = {
  data: Data;
  project: Project;
  patch: (patch: Partial<Project>) => void;
  back: () => void;
};

export function Builder({ data, project, patch, back }: BuilderProps) {
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

  const exportPng = () => {
    if (!svg.current) return;
    void exportProjectPng(svg.current, project, patch, exportSvgAsPng);
  };

  return (
    <div className="builder">
      <div className="builder-top">
        <button className="back" onClick={back}>
          <ChevronLeft />
          Templates
        </button>
        <input value={project.name} onChange={event => patch({ name: event.target.value })} />
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
      <div className="builder-body">
        <section className="controls">
          <h3>Graphic details</h3>
          <SelectField
            label="Format"
            value={project.format}
            onChange={format => patch({ format })}
          >
            <option value="feed">Feed · 1080×1350</option>
            <option value="story">Story · 1080×1920</option>
          </SelectField>
          <TemplateFields project={project} setDetails={setDetails} />

          <h3>Background hero image</h3>
          <BackgroundUpload
            on={async heroImage => {
              const size = await getImageDimensions(heroImage);
              patch(getUploadedHeroPatch(heroImage, size));
            }}
          />
          {project.heroImage && (
            <div className="selected-hero">
              <img src={project.heroImage} />
              <span>Background for this graphic only</span>
            </div>
          )}
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

          {data.profile.driverImage && (
            <>
              <h3>Driver image</h3>
              <ToggleField
                label="Show driver image"
                checked={project.driverVisible !== false}
                onChange={driverVisible => patch({ driverVisible })}
              />
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
              <button onClick={() => patch(resetDriverPatch)}>
                Reset driver image
              </button>
            </>
          )}

          <div className="locked">
            <Settings2 size={16} />
            <span>Text positions, logos, sponsor bar and design layers are locked.</span>
          </div>
        </section>
        <section className="preview">
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
