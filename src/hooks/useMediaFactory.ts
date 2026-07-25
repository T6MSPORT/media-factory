import { useEffect, useState } from 'react';
import type { PageId } from '../config/navigation';
import {
  addProject,
  completeOnboarding,
  createProject,
  updateProject,
} from '../state/mediaFactoryState';
import { load, save } from '../store';
import type { Data, Project, TemplateId } from '../types';

export function useMediaFactory() {
  const [data, setData] = useState<Data>(load);
  const [page, setPage] = useState<PageId>('home');
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => save(data), [data]);

  const finishOnboarding = (draft: Data) => {
    setData(completeOnboarding(draft));
    setPage('templates');
  };

  const openTemplate = (template: TemplateId) => {
    const project = createProject(template, data);
    setData(current => addProject(current, project));
    setActiveId(project.id);
    setPage('builder');
  };

  const openProject = (project: Project) => {
    setActiveId(project.id);
    setPage('builder');
  };

  const patchProject = (patch: Partial<Project>) => {
    setData(current => updateProject(current, activeId, patch));
  };

  return {
    activeProject: data.projects.find(project => project.id === activeId),
    data,
    finishOnboarding,
    openProject,
    openTemplate,
    page,
    patchProject,
    setData,
    setPage,
  };
}
