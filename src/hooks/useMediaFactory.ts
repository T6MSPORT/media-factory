import { useEffect, useRef, useState } from 'react';
import type { PageId } from '../config/navigation';
import {
  addProject,
  completeOnboarding,
  createProject,
  updateProject,
} from '../state/mediaFactoryState';
import { loadDurableData, saveDurableData } from '../durableStore';
import { loadResult, STORAGE_KEY, type StorageIssue } from '../store';
import type { Data, Project, TemplateId } from '../types';

export function useMediaFactory() {
  const initial = useRef(loadResult()).current;
  const [data, setData] = useState<Data>(initial.data);
  const [storageIssue, setStorageIssue] = useState<StorageIssue | undefined>(initial.issue);
  const [storageReady, setStorageReady] = useState(false);
  const [page, setPage] = useState<PageId>('home');
  const [activeId, setActiveId] = useState<string>();
  const dataRef = useRef(data);
  dataRef.current = data;

  const clearLegacyStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // IndexedDB is now authoritative, so a restricted localStorage API is harmless.
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialiseStorage = async () => {
      try {
        const savedData = await loadDurableData();
        if (cancelled) return;

        if (savedData) {
          setData(savedData);
        } else {
          if (initial.issue?.operation === 'load') {
            setStorageIssue(initial.issue);
            return;
          }
          await saveDurableData(dataRef.current);
        }

        if (cancelled) return;
        clearLegacyStorage();
        setStorageIssue(undefined);
        setStorageReady(true);
      } catch (error) {
        if (!cancelled) setStorageIssue({ operation: 'load', error });
      }
    };

    void initialiseStorage();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  useEffect(() => {
    if (!storageReady) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        await saveDurableData(data);
        if (!cancelled) setStorageIssue(undefined);
      } catch (error) {
        if (!cancelled) setStorageIssue({ operation: 'save', error });
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [data, storageReady]);

  const retryStorage = async () => {
    try {
      if (storageIssue?.operation === 'load') {
        const savedData = await loadDurableData();
        if (savedData) setData(savedData);
        else await saveDurableData(dataRef.current);
        clearLegacyStorage();
        setStorageReady(true);
      } else {
        await saveDurableData(dataRef.current);
      }
      setStorageIssue(undefined);
    } catch (error) {
      setStorageIssue({
        operation: storageIssue?.operation || 'save',
        error,
      });
    }
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
