import type { CSSProperties } from 'react';
import { StorageRecovery } from './components/StorageRecovery';
import { Builder } from './components/builder/Builder';
import { Sidebar } from './components/navigation/Sidebar';
import { MEDIA_FACTORY_UI_COLORS } from './config/branding';
import { useMediaFactory } from './hooks/useMediaFactory';
import {
  AuthPage,
  BackgroundRemoverPage,
  BrandingPage,
  HomePage,
  OnboardingPage,
  ProfilePage,
  ExportsPage,
  SponsorsPage,
  TemplateLibraryPage,
} from './pages';
import { WorkspaceMigration } from './pages/AuthPage';

export default function App() {
  const {
    activeProject,
    applyBackgroundGraphicToAll,
    archiveExport,
    authError,
    authReady,
    data,
    finishOnboarding,
    openTemplate,
    login,
    logout,
    migrationRequired,
    importLegacyWorkspace,
    inviteActivationMode,
    activateInvitation,
    showInviteActivation,
    hideInviteActivation,
    startFreshWorkspace,
    page,
    patchProject,
    passwordSetupMode,
    retryStorage,
    resetActiveTemplate,
    resendConfirmation,
    resetPassword,
    saveRecoveredPassword,
    setBackgroundGraphicLock,
    setData,
    setPage,
    storageIssue,
  } = useMediaFactory();

  if (!authReady) {
    return <div className="auth-loading">Connecting to Media Factory…</div>;
  }

  if (passwordSetupMode || !data.authentication.signedIn) {
    return (
      <>
        <StorageRecovery issue={storageIssue} retry={retryStorage} />
        <AuthPage
          data={data}
          authError={authError}
          passwordSetupMode={passwordSetupMode}
          inviteActivationMode={inviteActivationMode}
          login={login}
          activateInvitation={activateInvitation}
          showInviteActivation={showInviteActivation}
          hideInviteActivation={hideInviteActivation}
          resendConfirmation={resendConfirmation}
          resetPassword={resetPassword}
          saveRecoveredPassword={saveRecoveredPassword}
        />
      </>
    );
  }

  if (migrationRequired) {
    return (
      <WorkspaceMigration
        email={data.authentication.account?.email || ''}
        importExisting={importLegacyWorkspace}
        startFresh={startFreshWorkspace}
      />
    );
  }

  if (!data.onboardingComplete) {
    return (
      <>
        <StorageRecovery issue={storageIssue} retry={retryStorage} />
        <OnboardingPage data={data} finish={finishOnboarding} />
      </>
    );
  }

  const appStyle = {
    '--brand-primary': MEDIA_FACTORY_UI_COLORS.primary,
    '--brand-secondary': MEDIA_FACTORY_UI_COLORS.secondary,
    '--brand-accent': MEDIA_FACTORY_UI_COLORS.accent,
  } as CSSProperties;

  return (
    <>
      <StorageRecovery issue={storageIssue} retry={retryStorage} />
      <div className="app" style={appStyle}>
        <Sidebar
          activePage={page}
          accountEmail={data.authentication.account?.email}
          onNavigate={setPage}
          onSignOut={logout}
        />
        <main>
          {page === 'home' && (
            <HomePage
              data={data}
              openTemplate={openTemplate}
              openTemplates={() => setPage('templates')}
              openSponsors={() => setPage('sponsors')}
              openExports={() => setPage('exports')}
            />
          )}
          {page === 'templates' && <TemplateLibraryPage openTemplate={openTemplate} />}
          {page === 'profile' && <ProfilePage data={data} setData={setData} />}
          {page === 'branding' && <BrandingPage data={data} setData={setData} />}
          {page === 'sponsors' && <SponsorsPage data={data} setData={setData} />}
          {page === 'background-remover' && <BackgroundRemoverPage />}
          {page === 'exports' && (
            <ExportsPage data={data} setData={setData} />
          )}
          {page === 'builder' && activeProject && (
            <Builder
              data={data}
              project={activeProject}
              patch={patchProject}
              backgroundGraphicLocked={data.backgroundGraphic.locked}
              setBackgroundGraphicLocked={setBackgroundGraphicLock}
              applyBackgroundGraphicToAll={applyBackgroundGraphicToAll}
              archiveExport={archiveExport}
              resetTemplate={resetActiveTemplate}
              setDriverImage={driverImage => setData(current => ({
                ...current,
                profile: { ...current.profile, driverImage },
              }))}
              back={() => setPage('templates')}
            />
          )}
        </main>
      </div>
    </>
  );
}
