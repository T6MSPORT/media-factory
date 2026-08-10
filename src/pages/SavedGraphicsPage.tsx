import type { Data, Project } from '../types';

// Legacy component retained only for compatibility with older embedded clients.
export function SavedGraphicsPage({ data, setData, open }: {
  data: Data;
  setData: (data: Data) => void;
  open: (project: Project) => void;
}) {
  const saved = data.projects.filter(project => project.savedAt);
  if (!saved.length) {
    return <div><h3>No saved designs yet</h3><p>Open a template and select Save design.</p></div>;
  }
  return <div>{saved.map(project => <div key={project.id}>
    <label>Design name<input value={project.name} onChange={event => setData({
      ...data,
      projects: data.projects.map(item => item.id === project.id ? { ...item, name: event.target.value } : item),
    })} /><small>Edit this field to rename your saved design.</small></label>
    <small>Saved 25/07/26 &middot; Updated 25/07/26</small>
    <button onClick={() => open(project)}>Open</button>
    <button aria-label={`Delete ${project.name}`} onClick={() => {
      if (window.confirm(`Delete "${project.name}" from Saved Designs?`)) {
        setData({ ...data, projects: data.projects.filter(item => item.id !== project.id) });
      }
    }}>Delete</button>
  </div>)}</div>;
}
