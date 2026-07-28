import { TEMPLATE_FIELDS } from '../../config/templates';
import type { Project } from '../../types';
import { TextField } from '../forms/PropertyEditor';

type TemplateFieldsProps = {
  project: Project;
  setDetails: (details: Partial<Project['details']>) => void;
};

export function TemplateFields({ project, setDetails }: TemplateFieldsProps) {
  return (
    <>
      {TEMPLATE_FIELDS[project.template].map(field =>
        field.type === 'textarea' ? (
          <label key={field.key}>
            {field.label}
            <textarea
              value={project.details[field.key]}
              placeholder={field.placeholder}
              onChange={event =>
                setDetails({
                  [field.key]:
                    project.template === 'announcement'
                      ? event.target.value.toUpperCase()
                      : event.target.value,
                })
              }
            />
          </label>
        ) : (
          <TextField
            key={field.key}
            label={field.label}
            value={project.details[field.key]}
            type={field.type}
            onChange={value => setDetails({ [field.key]: value })}
          />
        ),
      )}
    </>
  );
}
