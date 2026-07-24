import type { DriverProfile } from '../types';
import type { ImagePurpose } from '../utils/images';

export type ProfileAssetKey = Extract<
  keyof DriverProfile,
  'driverImage' | 'teamLogo' | 'competitionLogo'
>;

export const PROFILE_ASSETS: Record<
  ProfileAssetKey,
  { label: string; purpose: ImagePurpose; fallback: string }
> = {
  driverImage: {
    label: 'Driver image',
    purpose: 'portrait',
    fallback: 'DRIVER',
  },
  teamLogo: {
    label: 'Team logo',
    purpose: 'logo',
    fallback: 'TEAM',
  },
  competitionLogo: {
    label: 'Competition logo',
    purpose: 'logo',
    fallback: 'COMP',
  },
};
