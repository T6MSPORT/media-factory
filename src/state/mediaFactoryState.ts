import { TEMPLATE_CATALOGUE } from '../config/templates';
import { emptyDetails, id } from '../store';
import type {
  BackgroundGraphicLayout,
  Data,
  Project,
  TemplateId,
} from '../types';

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
  const backgroundGraphic = data.backgroundGraphic.locked
    ? data.backgroundGraphic.feed
    : {
        graphicElement: 'none' as const,
        graphicElementX: 50,
        graphicElementY: 55,
        graphicElementSize: 45,
      };

  return {
    id: createId('graphic'),
    name: TEMPLATE_CATALOGUE.find(item => item.id === template)?.name || 'Graphic',
    template,
    format: 'feed',
    customWidth: 1080,
    customHeight: 1080,
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
    heroOverlayOpacity: 0,
    driverX: 0,
    driverY: 0,
    driverScale: 1,
    driverVisible: true,
    ...backgroundGraphic,
    details: {
      ...emptyDetails,
      ...(template === 'sponsor'
        ? {
            sponsorId:
              data.sponsors.find(sponsor => sponsor.logo)?.id ||
              data.sponsors[0]?.id ||
              '',
          }
        : {}),
    },
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

const backgroundGraphicKeys = [
  'graphicElement',
  'graphicElementX',
  'graphicElementY',
  'graphicElementSize',
] as const;

function getBackgroundGraphicFormatKey(project: Pick<Project, 'format'|'customWidth'|'customHeight'>) {
  if (project.format === 'story') return 'story' as const;
  if (
    project.format === 'custom' &&
    (project.customHeight || 1080) / (project.customWidth || 1080) >= 1.5
  ) {
    return 'story' as const;
  }
  return 'feed' as const;
}

function getProjectBackgroundGraphic(project: Project): BackgroundGraphicLayout {
  return {
    graphicElement: project.graphicElement || 'none',
    graphicElementX: project.graphicElementX ?? 50,
    graphicElementY: project.graphicElementY ?? 55,
    graphicElementSize: project.graphicElementSize ?? 45,
  };
}

function getBackgroundGraphicPatch(
  patch: Partial<Project>,
): Partial<BackgroundGraphicLayout> {
  return Object.fromEntries(
    backgroundGraphicKeys
      .filter(key => patch[key] !== undefined)
      .map(key => [key, patch[key]]),
  ) as Partial<BackgroundGraphicLayout>;
}

function hasBackgroundGraphicPatch(patch: Partial<Project>) {
  return backgroundGraphicKeys.some(key => patch[key] !== undefined);
}

export function updateProjectWithBackgroundGraphicLock(
  data: Data,
  activeId: string | undefined,
  patch: Partial<Project>,
  now: () => string = () => new Date().toISOString(),
): Data {
  const activeProject = data.projects.find(project => project.id === activeId);
  if (!activeProject) return data;

  const nextProject = { ...activeProject, ...patch };
  const nextFormat = getBackgroundGraphicFormatKey(nextProject);
  const currentFormat = getBackgroundGraphicFormatKey(activeProject);
  let resolvedPatch = patch;
  let backgroundGraphic = data.backgroundGraphic;

  if (backgroundGraphic.locked && nextFormat !== currentFormat) {
    resolvedPatch = { ...resolvedPatch, ...backgroundGraphic[nextFormat] };
  }

  if (backgroundGraphic.locked && hasBackgroundGraphicPatch(resolvedPatch)) {
    const nextLayout = {
      ...backgroundGraphic[nextFormat],
      ...getBackgroundGraphicPatch(resolvedPatch),
    };
    backgroundGraphic = {
      ...backgroundGraphic,
      [nextFormat]: nextLayout,
    };
    const timestamp = now();

    return {
      ...data,
      backgroundGraphic,
      projects: data.projects.map(project => {
        if (project.id === activeId) {
          return { ...project, ...resolvedPatch, ...nextLayout, updatedAt: timestamp };
        }
        return getBackgroundGraphicFormatKey(project) === nextFormat
          ? { ...project, ...nextLayout, updatedAt: timestamp }
          : project;
      }),
    };
  }

  return updateProject(data, activeId, resolvedPatch, now);
}

export function setBackgroundGraphicLocked(
  data: Data,
  activeId: string | undefined,
  locked: boolean,
  now: () => string = () => new Date().toISOString(),
): Data {
  if (!locked) {
    return {
      ...data,
      backgroundGraphic: { ...data.backgroundGraphic, locked: false },
    };
  }

  const activeProject = data.projects.find(project => project.id === activeId);
  if (!activeProject) return data;
  const layout = getProjectBackgroundGraphic(activeProject);
  const timestamp = now();

  return {
    ...data,
    backgroundGraphic: {
      ...data.backgroundGraphic,
      locked: true,
      [getBackgroundGraphicFormatKey(activeProject)]: layout,
    },
    projects: data.projects.map(project =>
      getBackgroundGraphicFormatKey(project) === getBackgroundGraphicFormatKey(activeProject)
        ? { ...project, ...layout, updatedAt: timestamp }
        : project,
    ),
  };
}

export function applyBackgroundGraphicToAllTemplates(
  data: Data,
  activeId: string | undefined,
  now: () => string = () => new Date().toISOString(),
): Data {
  const activeProject = data.projects.find(project => project.id === activeId);
  if (!activeProject) return data;
  const layout = getProjectBackgroundGraphic(activeProject);
  const timestamp = now();

  return {
    ...data,
    backgroundGraphic: {
      ...data.backgroundGraphic,
      [getBackgroundGraphicFormatKey(activeProject)]: layout,
    },
    projects: data.projects.map(project =>
      getBackgroundGraphicFormatKey(project) === getBackgroundGraphicFormatKey(activeProject)
        ? { ...project, ...layout, updatedAt: timestamp }
        : project,
    ),
  };
}
