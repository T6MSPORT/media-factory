import { useEffect, useState } from 'react';
import type { PageId } from '../config/navigation';
import { TEMPLATE_CATALOGUE } from '../config/templates';
import { emptyDetails, id, load, save } from '../store';
import type { Data, Project, TemplateId } from '../types';

const createProject = (template: TemplateId, data: Data): Project => {
  const timestamp = new Date().toISOString();

  return {
    id: id('graphic'),
    name: TEMPLATE_CATALOGUE.find(item => item.id === template)?.name || 'Graphic',
    template,
    format: 'feed',
    sponsorIds: data.sponsors.slice(0, 10).map(sponsor => sponsor.id),
    createdAt: timestamp,
    updatedAt: timestamp,
    heroImage: '',
    heroImageWidth: 0,
    heroImageHeight: 0,
    heroX: 0,
    heroY: 0,
    heroScale: 1,
    heroFlip: false,
    driverX: 0,
    driverY: 0,
    driverScale: 1,
    driverVisible: true,
    details: { ...emptyDetails },
  };
};

export function useMediaFactory() {
  const [data, setData] = useState<Data>(load);
  const [page, setPage] = useState<PageId>('home');
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => save(data), [data]);

  const finishOnboarding = (draft: Data) => {
    setData({ ...draft, onboardingComplete: true });
    setPage('templates');
  };

  const openTemplate = (template: TemplateId) => {
    const project = createProject(template, data);
    setData(current => ({ ...current, projects: [project, ...current.projects] }));
    setActiveId(project.id);
    setPage('builder');
  };

  const openProject = (project: Project) => {
    setActiveId(project.id);
    setPage('builder');
  };

  const patchProject = (patch: Partial<Project>) => {
    setData(current => ({
      ...current,
      projects: current.projects.map(project =>
        project.id === activeId
          ? { ...project, ...patch, updatedAt: new Date().toISOString() }
          : project,
      ),
    }));
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
