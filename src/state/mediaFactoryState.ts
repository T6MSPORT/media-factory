import { TEMPLATE_CATALOGUE } from '../config/templates';
import { emptyDetails, id } from '../store';
import type { Data, Project, TemplateId } from '../types';

type ProjectDependencies = {
  createId?: (prefix: string) => string;
  now?: () => string;
};

export function createProject(
  template: TemplateId,
  data: Data,
  dependencies: ProjectDependencies = {},
): Project {
  const timestamp = (dependencies.now || (() => new Date().toISOString()))();
  const createId = dependencies.createId || id;

  return {
    id: createId('graphic'),
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
    graphicElement: 'none',
    graphicElementX: 50,
    graphicElementY: 55,
    graphicElementSize: 45,
    details: { ...emptyDetails },
  };
}

export function addProject(data: Data, project: Project): Data {
  return { ...data, projects: [project, ...data.projects] };
}

export function completeOnboarding(data: Data): Data {
  return { ...data, onboardingComplete: true };
}

export function updateProject(
  data: Data,
  activeId: string | undefined,
  patch: Partial<Project>,
  now: () => string = () => new Date().toISOString(),
): Data {
  return {
    ...data,
    projects: data.projects.map(project =>
      project.id === activeId ? { ...project, ...patch, updatedAt: now() } : project,
    ),
  };
}
