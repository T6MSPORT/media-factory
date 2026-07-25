import { FolderKanban, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { TEMPLATE_CATALOGUE } from '../config/templates';
import {
  getSavedProjects,
  removeSavedProject,
  renameSavedProject,
} from '../state/pageState';
import type { Data, Project } from '../types';

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
        title="Saved graphics"
        subtitle="Reopen graphics that have been saved by exporting a PNG."
      />
      {savedProjects.length === 0 ? (
        <div className="empty">
          <FolderKanban size={42} />
          <h3>No saved graphics yet</h3>
          <p>A graphic is saved here when its PNG is exported.</p>
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
              <input
                value={project.name}
                onChange={(event) =>
                  setData(renameSavedProject(data, project.id, event.target.value))
                }
              />
              <small>
                Saved {new Date(project.exportedAt!).toLocaleDateString()} · Updated{' '}
                {new Date(project.updatedAt).toLocaleDateString()}
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
