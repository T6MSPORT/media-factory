import type { Data, TemplateId } from '../types';
import { TEMPLATE_CATALOGUE } from '../config/templates';
import { PageHeader, StatCard } from '../components/ui';
import { getSavedProjects } from '../state/pageState';

type HomePageProps = {
  data: Data;
  openTemplate: (template: TemplateId) => void;
  openTemplates: () => void;
  openSponsors: () => void;
  openSavedDesigns: () => void;
};

function TemplateCard({
  template,
  openTemplate,
}: {
  template: (typeof TEMPLATE_CATALOGUE)[number];
  openTemplate: (template: TemplateId) => void;
}) {
  return (
    <button className="template-card" onClick={() => openTemplate(template.id)}>
      <div className={`thumb ${template.id}`}>
        <span>{template.name}</span>
      </div>
      <b>{template.name}</b>
      <p>{template.description}</p>
    </button>
  );
}

export function HomePage({
  data,
  openTemplate,
  openTemplates,
  openSponsors,
  openSavedDesigns,
}: HomePageProps) {
  return (
    <div className="page branded-home">
      <PageHeader
        title={`Welcome, ${data.profile.name}`}
        subtitle="Select a template whenever you need a new graphic."
      />

      <section className="hero">
        <div>
          <span className="eyebrow">YOUR MEDIA FACTORY</span>
          <h2>
            Your profile.
            <br />
            Every graphic.
          </h2>
          <p>
            Your driver details, images, colours and sponsors are reused automatically across all
            templates.
          </p>
          <button className="light" onClick={openTemplates}>
            Browse templates
          </button>
        </div>

        <div className="hero-card">
          <div className="mock-number">#{data.profile.number}</div>
          <b>{data.profile.name.toUpperCase()}</b>
          <span>{data.profile.team || 'RACING DRIVER'}</span>
        </div>
      </section>

      <div className="stats">
        <StatCard
          value={TEMPLATE_CATALOGUE.length}
          label="Templates"
          onClick={openTemplates}
        />
        <StatCard
          value={data.sponsors.length}
          label="Sponsors"
          onClick={openSponsors}
        />
        <StatCard
          value={getSavedProjects(data).length}
          label="Saved designs"
          onClick={openSavedDesigns}
        />
      </div>

      <h3>Popular templates</h3>
      <div className="template-grid">
        {TEMPLATE_CATALOGUE.slice(0, 4).map(template => (
          <TemplateCard key={template.id} template={template} openTemplate={openTemplate} />
        ))}
      </div>
    </div>
  );
}
