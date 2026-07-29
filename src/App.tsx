import type { CSSProperties } from 'react';
import { StorageRecovery } from './components/StorageRecovery';
import { Builder } from './components/builder/Builder';
import { Sidebar } from './components/navigation/Sidebar';
import { MEDIA_FACTORY_UI_COLORS } from './config/branding';
import { useMediaFactory } from './hooks/useMediaFactory';
import {
  BrandingPage,
  HomePage,
  OnboardingPage,
  ProfilePage,
  SavedGraphicsPage,
  SponsorsPage,
  TemplateLibraryPage,
} from './pages';

export default function App() {
  const {
    activeProject,
    data,
    finishOnboarding,
    openProject,
    openTemplate,
    page,
    patchProject,
    retryStorage,
    setData,
    setPage,
    storageIssue,
  } = useMediaFactory();

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
        <Sidebar activePage={page} onNavigate={setPage} />
        <main>
          {page === 'home' && (
            <HomePage
              data={data}
              openTemplate={openTemplate}
              openTemplates={() => setPage('templates')}
            />
          )}
          {page === 'templates' && <TemplateLibraryPage openTemplate={openTemplate} />}
          {page === 'profile' && <ProfilePage data={data} setData={setData} />}
          {page === 'branding' && <BrandingPage data={data} setData={setData} />}
          {page === 'sponsors' && <SponsorsPage data={data} setData={setData} />}
          {page === 'saved' && (
            <SavedGraphicsPage data={data} setData={setData} open={openProject} />
          )}
          {page === 'builder' && activeProject && (
            <Builder
              data={data}
              project={activeProject}
              patch={patchProject}
              back={() => setPage('templates')}
            />
          )}
        </main>
      </div>
    </>
  );
}
