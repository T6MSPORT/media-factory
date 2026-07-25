import { useEffect, useRef, useState } from 'react';
import type { PageId } from '../config/navigation';
import {
  addProject,
  completeOnboarding,
  createProject,
  updateProject,
} from '../state/mediaFactoryState';
import { loadResult, save, type StorageIssue } from '../store';
import type { Data, Project, TemplateId } from '../types';

export function useMediaFactory() {
  const initial = useRef(loadResult()).current;
  const [data, setData] = useState<Data>(initial.data);
  const [storageIssue, setStorageIssue] = useState<StorageIssue | undefined>(initial.issue);
  const [page, setPage] = useState<PageId>('home');
  const [activeId, setActiveId] = useState<string>();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (storageIssue?.operation === 'load') return;

    let error: unknown;
    const saved = save(data, localStorage, nextError => {
      error = nextError;
    });
    setStorageIssue(saved ? undefined : { operation: 'save', error });
  }, [data]);

  const retryStorage = () => {
    if (storageIssue?.operation === 'load') {
      const result = loadResult();
      if (!result.issue) setData(result.data);
      setStorageIssue(result.issue);
      return;
    }

    let error: unknown;
    const saved = save(data, localStorage, nextError => {
      error = nextError;
    });
    setStorageIssue(saved ? undefined : { operation: 'save', error });
  };

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
    storageIssue,
    retryStorage,
  };
}
