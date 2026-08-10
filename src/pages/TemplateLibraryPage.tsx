import type { TemplateId } from '../types';
import { TEMPLATE_CATALOGUE } from '../config/templates';
import { PageHeader } from '../components/ui';
import { TemplateThumbnail } from '../components/TemplateThumbnail';

type TemplateLibraryPageProps = {
  openTemplate: (template: TemplateId) => void;
};

export function TemplateLibraryPage({ openTemplate }: TemplateLibraryPageProps) {
  return (
    <div className="page">
      <PageHeader
        title="Templates"
        subtitle="Select a template to open its graphic generator."
      />

      <div className="template-grid">
        {TEMPLATE_CATALOGUE.map(template => (
          <button
            className="template-card"
            onClick={() => openTemplate(template.id)}
            key={template.id}
          >
            <TemplateThumbnail id={template.id} name={template.name} />
            <b>{template.name}</b>
            <p>{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
