import { useEffect, useRef, useState } from 'react';
import type { PageId } from '../config/navigation';
import {
  addProject,
  applyBackgroundGraphicToAllTemplates,
  completeOnboarding,
  createProject,
  setBackgroundGraphicLocked,
  updateProjectWithBackgroundGraphicLock,
} from '../state/mediaFactoryState';
import {
  applyCloudAccount,
  clearCloudSession,
  markEmailConfirmationPending,
  validateRegistration,
} from '../state/authState';
import {
  currentCloudAccount,
  isCloudAuthConfigured,
  isEmailConfirmationError,
  listenForCloudAuth,
  registerCloudAccount,
  requestPasswordReset,
  resendSignupConfirmation,
  signInCloud,
  signOutCloud,
  updateCloudPassword,
} from '../services/cloudAuth';
import { loadDurableData, saveDurableData } from '../durableStore';
import { loadResult, STORAGE_KEY, type StorageIssue } from '../store';
import type { Data, Project, TemplateId } from '../types';

export function useMediaFactory() {
  const initial = useRef(loadResult()).current;
  const [data, setData] = useState<Data>(initial.data);
  const [storageIssue, setStorageIssue] = useState<StorageIssue | undefined>(initial.issue);
  const [storageReady, setStorageReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(
    () => window.location.hash.includes('type=recovery'),
  );
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
    if (!isCloudAuthConfigured()) {
      setAuthError('Cloud login has not been configured yet.');
      setAuthReady(true);
      return;
    }

    let cancelled = false;
    const stopListening = listenForCloudAuth((event, account) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (account) {
        setData(current => applyCloudAccount(current, account));
      } else if (event === 'SIGNED_OUT') {
        setData(current => clearCloudSession(current));
      }
    });

    void currentCloudAccount()
      .then(account => {
        if (cancelled) return;
        setData(current =>
          account ? applyCloudAccount(current, account) : clearCloudSession(current),
        );
        setAuthError('');
      })
      .catch(error => {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : 'Cloud login is unavailable.');
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });

    return () => {
      cancelled = true;
      stopListening();
    };
  }, [storageReady]);

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

  const register = async (
    email: string,
    password: string,
    profile: Data['profile'],
  ) => {
    validateRegistration(email, password, profile.name);
    const result = await registerCloudAccount(email, password, profile.name);
    const registered = result.signedIn
      ? applyCloudAccount(dataRef.current, result.account)
      : markEmailConfirmationPending(dataRef.current, result.account);
    setData(registered);
    if (result.signedIn) setPage('templates');
  };

  const login = async (email: string, password: string) => {
    try {
      const account = await signInCloud(email, password);
      setData(applyCloudAccount(dataRef.current, account));
      setPage('home');
    } catch (error) {
      if (isEmailConfirmationError(error) && dataRef.current.authentication.account) {
        setData(current =>
          markEmailConfirmationPending(current, current.authentication.account!),
        );
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOutCloud();
    setData(current => clearCloudSession(current));
    setActiveId(undefined);
    setPage('home');
  };

  const resetPassword = async (email: string) => {
    await requestPasswordReset(email);
  };

  const resendConfirmation = async (email: string) => {
    await resendSignupConfirmation(email);
  };

  const saveRecoveredPassword = async (password: string) => {
    if (password.length < 8) {
      throw new Error('Your password must be at least 8 characters.');
    }
    await updateCloudPassword(password);
    setPasswordRecovery(false);
    window.history.replaceState({}, document.title, window.location.pathname);
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
    setData(current =>
      updateProjectWithBackgroundGraphicLock(current, activeId, patch),
    );
  };

  const setBackgroundGraphicLock = (locked: boolean) => {
    setData(current => setBackgroundGraphicLocked(current, activeId, locked));
  };

  const applyBackgroundGraphicToAll = () => {
    setData(current => applyBackgroundGraphicToAllTemplates(current, activeId));
  };

  return {
    activeProject: data.projects.find(project => project.id === activeId),
    authError,
    authReady,
    data,
    finishOnboarding,
    login,
    logout,
    openProject,
    openTemplate,
    page,
    patchProject,
    passwordRecovery,
    setBackgroundGraphicLock,
    applyBackgroundGraphicToAll,
    setData,
    setPage,
    storageIssue,
    retryStorage,
    register,
    resendConfirmation,
    resetPassword,
    saveRecoveredPassword,
  };
}
