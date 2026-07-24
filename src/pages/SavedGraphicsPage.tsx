import { FolderKanban, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { TEMPLATE_CATALOGUE } from '../config/templates';
import type { Data, Project } from '../types';

type SavedGraphicsPageProps = {
  data: Data;
  setData: (data: Data) => void;
  open: (project: Project) => void;
};

export function SavedGraphicsPage({ data, setData, open }: SavedGraphicsPageProps) {
  const savedProjects = data.projects.filter((project) => project.exportedAt);

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
                  setData({
                    ...data,
                    projects: data.projects.map((item) =>
                      item.id === project.id
                        ? {
                            ...item,
                            name: event.target.value,
                            updatedAt: new Date().toISOString(),
                          }
                        : item,
                    ),
                  })
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
                  onClick={() =>
                    setData({
                      ...data,
                      projects: data.projects.filter((item) => item.id !== project.id),
                    })
                  }
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
