import { id } from '../store';
import type { Branding, Data, DriverProfile, Sponsor } from '../types';

export const SPONSOR_LIMIT = 10;

export function updateProfile(data: Data, patch: Partial<DriverProfile>): Data {
  return {
    ...data,
    profile: { ...data.profile, ...patch },
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

export function removeSponsor(data: Data, sponsorId: string): Data {
  return {
    ...data,
    sponsors: data.sponsors.filter(sponsor => sponsor.id !== sponsorId),
  };
}
