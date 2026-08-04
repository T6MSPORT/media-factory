import { id } from '../store';
import type { Branding, Data, DriverProfile, Project, Sponsor } from '../types';

export const SPONSOR_LIMIT = 10;

export function updateProfile(data: Data, patch: Partial<DriverProfile>): Data {
  const safePatch = { ...patch };
  if (data.profile.nameLocked) delete safePatch.name;

  return {
    ...data,
    profile: { ...data.profile, ...safePatch },
  };
}

export function updateBranding(data: Data, patch: Partial<Branding>): Data {
  return {
    ...data,
    branding: { ...data.branding, ...patch },
  };
}

export function addSponsor(
  data: Data,
  createId: (prefix: string) => string = id,
): Data {
  if (data.sponsors.length >= SPONSOR_LIMIT) return data;

  return {
    ...data,
    sponsors: [
      ...data.sponsors,
      { id: createId('sponsor'), name: 'New Sponsor' },
    ],
  };
}

export function updateSponsor(
  data: Data,
  sponsorId: string,
  patch: Partial<Sponsor>,
): Data {
  return {
    ...data,
    sponsors: data.sponsors.map(sponsor =>
      sponsor.id === sponsorId ? { ...sponsor, ...patch } : sponsor,
    ),
  };
}

export function moveSponsor(
  data: Data,
  sponsorId: string,
  direction: -1 | 1,
): Data {
  const currentIndex = data.sponsors.findIndex(sponsor => sponsor.id === sponsorId);
  const nextIndex = currentIndex + direction;
  if (
    currentIndex < 0 ||
    nextIndex < 0 ||
    nextIndex >= data.sponsors.length
  ) {
    return data;
  }

  const sponsors = [...data.sponsors];
  [sponsors[currentIndex], sponsors[nextIndex]] = [
    sponsors[nextIndex],
    sponsors[currentIndex],
  ];

  return { ...data, sponsors };
}

export function removeSponsor(data: Data, sponsorId: string): Data {
  return {
    ...data,
    sponsors: data.sponsors.filter(sponsor => sponsor.id !== sponsorId),
  };
}

export function getSavedProjects(data: Data): Project[] {
  return data.projects.filter(project => project.exportedAt);
}

export function renameSavedProject(
  data: Data,
  projectId: string,
  name: string,
  updatedAt: string = new Date().toISOString(),
): Data {
  return {
    ...data,
    projects: data.projects.map(project =>
      project.id === projectId ? { ...project, name, updatedAt } : project,
    ),
  };
}

export function removeSavedProject(
  data: Data,
  projectId: string,
  confirmDelete: (message: string) => boolean = message => window.confirm(message),
): Data {
  const project = data.projects.find(item => item.id === projectId && item.exportedAt);
  if (!project || !confirmDelete(`Delete "${project.name}" from Saved Graphics?`)) {
    return data;
  }

  return {
    ...data,
    projects: data.projects.filter(item => item.id !== projectId),
  };
}
