import { FolderKanban, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { TEMPLATE_CATALOGUE } from '../config/templates';
import {
  getSavedProjects,
  removeSavedProject,
  renameSavedProject,
} from '../state/pageState';
import type { Data, Project } from '../types';
import { formatSavedGraphicDate } from '../utils/format';

type SavedGraphicsPageProps = {
  data: Data;
  setData: (data: Data) => void;
  open: (project: Project) => void;
};

export function SavedGraphicsPage({ data, setData, open }: SavedGraphicsPageProps) {
  const savedProjects = getSavedProjects(data);

  return (
    <div className="page">
      <PageHeader
        title="Saved designs"
        subtitle="Reopen editable designs you have deliberately saved."
      />
      {savedProjects.length === 0 ? (
        <div className="empty">
          <FolderKanban size={42} />
          <h3>No saved designs yet</h3>
          <p>Open a template and select Save design to add it here.</p>
        </div>
      ) : (
        <div className="project-grid">
          {savedProjects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className={`project-thumb ${project.template}`}>
                <span>
                  {TEMPLATE_CATALOGUE.find((template) => template.id === project.template)?.name}
                </span>
              </div>
              <label className="saved-design-name">
                <span><Pencil size={14} aria-hidden="true" /> Design name</span>
                <input
                  aria-label={`Rename ${project.name}`}
                  value={project.name}
                  onChange={(event) =>
                    setData(renameSavedProject(data, project.id, event.target.value))
                  }
                />
                <small>Edit this field to rename your saved design.</small>
              </label>
              <small>
                Saved {formatSavedGraphicDate(project.savedAt!)} · Updated{' '}
                {formatSavedGraphicDate(project.updatedAt)}
              </small>
              <div>
                <button onClick={() => open(project)}>Open</button>
                <button
                  className="icon danger"
                  aria-label={`Delete ${project.name}`}
                  onClick={() => {
                    const next = removeSavedProject(data, project.id);
                    if (next !== data) setData(next);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
