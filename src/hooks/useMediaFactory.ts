import { useCallback, useEffect, useRef, useState } from 'react';
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
  hasWorkspaceContent,
  markEmailConfirmationPending,
  signedOutData,
  validateRegistration,
} from '../state/authState';
import {
  activateInvitedCloudAccount,
  currentCloudAccount,
  consumeAuthLink,
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
import { loadCloudWorkspace, saveCloudWorkspace } from '../services/cloudWorkspace';
import { uploadCloudExport } from '../services/cloudExports';
import {
  deleteLegacyData,
  loadAccountData,
  loadDurableData,
  saveAccountData,
} from '../durableStore';
import { loadResult, STORAGE_KEY, type StorageIssue } from '../store';
import { starter } from '../store';
import type { Account, Data, Project, TemplateId } from '../types';
import type { PngExportResult } from '../utils/export';

export function useMediaFactory() {
  const initial = useRef(loadResult()).current;
  const [data, setData] = useState<Data>(() =>
    signedOutData(initial.data.authentication.lastEmail),
  );
  const [storageIssue, setStorageIssue] = useState<StorageIssue | undefined>(initial.issue);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>();
  const [migrationCandidate, setMigrationCandidate] = useState<Data>();
  const [passwordSetupMode, setPasswordSetupMode] = useState<'invite' | 'recovery' | null>(
    () => window.location.hash.includes('type=recovery') ? 'recovery' : null,
  );
  const [inviteActivationMode, setInviteActivationMode] = useState(
    () => new URLSearchParams(window.location.search).get('activate') === 'invite',
  );
  const [page, setPage] = useState<PageId>('home');
  const [activeId, setActiveId] = useState<string>();
  const dataRef = useRef(data);
  const legacyRef = useRef<Data | undefined>(undefined);
  dataRef.current = data;

  const clearLegacyStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // IndexedDB is now authoritative, so a restricted localStorage API is harmless.
    }
  };

  const activateAccount = useCallback(async (
    account: Account,
    suppliedLegacy?: Data,
  ) => {
    let saved: Data | undefined;
    try {
      const cloudWorkspace = await loadCloudWorkspace(account.id);
      saved = cloudWorkspace?.data;
      if (saved) await saveAccountData(account.id, saved);
      setStorageIssue(undefined);
    } catch (error) {
      setStorageIssue({ operation: 'load', error });
      try {
        saved = await loadAccountData(account.id);
      } catch {
        // IndexedDB is only a cache; retain the cloud error as the actionable issue.
      }
    }

    if (saved) {
      setMigrationCandidate(undefined);
      setActiveWorkspaceId(account.id);
      setData(applyCloudAccount(saved, account));
      return;
    }

    const legacy = suppliedLegacy || legacyRef.current;
    if (legacy && hasWorkspaceContent(legacy)) {
      const legacyEmail = legacy.authentication.lastEmail || legacy.authentication.account?.email;
      if (legacyEmail?.toLowerCase() === account.email.toLowerCase()) {
        const migrated = applyCloudAccount(legacy, account);
        setMigrationCandidate(undefined);
        setActiveWorkspaceId(account.id);
        setData(migrated);
        try {
          await saveCloudWorkspace(account.id, migrated);
          await saveAccountData(account.id, migrated);
          await deleteLegacyData();
          clearLegacyStorage();
          legacyRef.current = undefined;
        } catch (error) {
          setStorageIssue({ operation: 'save', error });
        }
        return;
      }

      setActiveWorkspaceId(undefined);
      setMigrationCandidate(legacy);
      setData(applyCloudAccount(starter, account));
      return;
    }

    const fresh = applyCloudAccount(starter, account);
    setMigrationCandidate(undefined);
    setActiveWorkspaceId(account.id);
    setData(fresh);
    try {
      await saveCloudWorkspace(account.id, fresh);
      await saveAccountData(account.id, fresh);
    } catch (error) {
      setStorageIssue({ operation: 'save', error });
    }
  }, []);

  useEffect(() => {
    if (!isCloudAuthConfigured()) {
      setAuthError('Cloud login has not been configured yet.');
      setAuthReady(true);
      return;
    }

    let cancelled = false;
    const legacyPromise = loadDurableData()
      .then(saved => {
        if (cancelled) return undefined;
        const legacy = saved || (hasWorkspaceContent(initial.data) ? initial.data : undefined);
        legacyRef.current = legacy;
        return legacy;
      })
      .catch(error => {
        if (!cancelled) setStorageIssue({ operation: 'load', error });
        const fallback = hasWorkspaceContent(initial.data) ? initial.data : undefined;
        legacyRef.current = fallback;
        return fallback;
      });

    const stopListening = listenForCloudAuth((event, account, error) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') setPasswordSetupMode('recovery');
      if (error) setAuthError(error.message);
      if (event === 'SIGNED_OUT') {
        const lastEmail = dataRef.current.authentication.account?.email;
        setActiveWorkspaceId(undefined);
        setMigrationCandidate(undefined);
        setData(signedOutData(lastEmail));
      }
    });

    void consumeAuthLink()
      .then(linkType => {
        if (!cancelled && linkType) {
          setPasswordSetupMode(linkType);
        }
        return currentCloudAccount();
      })
      .then(async account => {
        if (cancelled) return;
        if (account) {
          await activateAccount(account, await legacyPromise);
        } else {
          setData(current => signedOutData(current.authentication.lastEmail));
        }
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
  }, [activateAccount, initial]);

  useEffect(() => {
    if (!activeWorkspaceId || !data.authentication.signedIn || migrationCandidate) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        await saveCloudWorkspace(activeWorkspaceId, data);
        await saveAccountData(activeWorkspaceId, data);
        if (!cancelled) setStorageIssue(undefined);
      } catch (error) {
        if (!cancelled) setStorageIssue({ operation: 'save', error });
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeWorkspaceId, data, migrationCandidate]);

  const retryStorage = async () => {
    try {
      if (!activeWorkspaceId) throw new Error('Sign in before retrying browser storage.');
      await saveCloudWorkspace(activeWorkspaceId, dataRef.current);
      await saveAccountData(activeWorkspaceId, dataRef.current);
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
    setAuthError('');
    validateRegistration(email, password, profile.name);
    const result = await registerCloudAccount(email, password, profile.name);
    if (result.signedIn) {
      await activateAccount(result.account);
      setPage('templates');
    } else {
      setData(markEmailConfirmationPending(signedOutData(email), result.account));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthError('');
      const account = await signInCloud(email, password);
      await activateAccount(account);
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
    const lastEmail = dataRef.current.authentication.account?.email;
    await signOutCloud();
    setActiveWorkspaceId(undefined);
    setMigrationCandidate(undefined);
    setData(signedOutData(lastEmail));
    setActiveId(undefined);
    setPage('home');
  };

  const resetPassword = async (email: string) => {
    setAuthError('');
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
    setPasswordSetupMode(null);
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
  };

  const activateInvitation = async (
    email: string,
    code: string,
    password: string,
    driverName: string,
  ) => {
    setAuthError('');
    const account = await activateInvitedCloudAccount(email, code, password, driverName);
    await activateAccount(account);
    setInviteActivationMode(false);
    window.history.replaceState({}, document.title, window.location.pathname);
    setPage('home');
  };

  const showInviteActivation = () => {
    setAuthError('');
    setInviteActivationMode(true);
    window.history.replaceState({}, document.title, `${window.location.pathname}?activate=invite`);
  };

  const hideInviteActivation = () => {
    setAuthError('');
    setInviteActivationMode(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const importLegacyWorkspace = async () => {
    const account = dataRef.current.authentication.account;
    if (!account || !migrationCandidate) return;
    const migrated = applyCloudAccount(migrationCandidate, account);
    setActiveWorkspaceId(account.id);
    setMigrationCandidate(undefined);
    setData(migrated);
    try {
      await saveCloudWorkspace(account.id, migrated);
      await saveAccountData(account.id, migrated);
      await deleteLegacyData();
      clearLegacyStorage();
      legacyRef.current = undefined;
    } catch (error) {
      setStorageIssue({ operation: 'save', error });
    }
  };

  const startFreshWorkspace = async () => {
    const account = dataRef.current.authentication.account;
    if (!account) return;
    const fresh = applyCloudAccount(starter, account);
    setActiveWorkspaceId(account.id);
    setMigrationCandidate(undefined);
    setData(fresh);
    try {
      await saveCloudWorkspace(account.id, fresh);
      await saveAccountData(account.id, fresh);
      await deleteLegacyData();
      clearLegacyStorage();
      legacyRef.current = undefined;
    } catch (error) {
      setStorageIssue({ operation: 'save', error });
    }
  };

  const openTemplate = (template: TemplateId) => {
    const existing = data.projects.find(project => project.template === template);
    const project = existing || createProject(template, data);
    if (!existing) setData(current => addProject(current, project));
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

  const resetActiveTemplate = () => {
    setData(current => ({
      ...current,
      projects: current.projects.map(project => {
        if (project.id !== activeId) return project;
        return {
          ...createProject(project.template, current),
          id: project.id,
          createdAt: project.createdAt,
        };
      }),
    }));
  };

  const archiveExport = async (project: Project, result: PngExportResult) => {
    const accountId = dataRef.current.authentication.account?.id;
    if (!accountId) throw new Error('Sign in before exporting.');
    const record = await uploadCloudExport(accountId, project, result);
    setData(current => ({ ...current, exports: [record, ...current.exports].slice(0, 100) }));
  };

  return {
    activeProject: data.projects.find(project => project.id === activeId),
    authError,
    authReady,
    data,
    finishOnboarding,
    login,
    logout,
    migrationRequired: Boolean(migrationCandidate),
    importLegacyWorkspace,
    inviteActivationMode,
    activateInvitation,
    showInviteActivation,
    hideInviteActivation,
    startFreshWorkspace,
    openTemplate,
    page,
    patchProject,
    passwordSetupMode,
    setBackgroundGraphicLock,
    applyBackgroundGraphicToAll,
    resetActiveTemplate,
    archiveExport,
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
