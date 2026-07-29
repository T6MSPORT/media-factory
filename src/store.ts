import { MOTORSPORT_FONTS } from './config/branding';
import type {
  Data,
  DriverProfile,
  GraphicDetails,
  Project,
  ScheduleDay,
  ScheduleDayName,
  ScheduleSessionType,
} from './types';

export const STORAGE_KEY = 'media-factory-individual-v1';

export const emptyDetails: GraphicDetails = {
  eventName: '',
  round: '',
  circuit: '',
  date: '',
  time: '',
  headline: '',
  subheadline: '',
  result: '',
  position: '',
  scheduleLines: '',
  sponsorName: '',
  scheduleDayCount: 1,
  resultSession: 'race',
  raceNumber: '1',
  scheduleDays: [
    {
      day: '',
      sessions: Array.from({ length: 5 }, () => ({
        type: '' as ScheduleSessionType,
        time: '',
      })),
    },
  ],
};

const scheduleDayNames: ScheduleDayName[] = ['', 'Friday', 'Saturday', 'Sunday'];
const scheduleSessionTypes: ScheduleSessionType[] = [
  '',
  'Practice',
  'Qualifying',
  'Race',
];

function normaliseScheduleDays(details: Partial<GraphicDetails>): ScheduleDay[] {
  const suppliedDays = Array.isArray(details.scheduleDays)
    ? details.scheduleDays.slice(0, 3)
    : [];
  const requestedCount = Number(details.scheduleDayCount);
  const dayCount = Math.min(
    3,
    Math.max(1, Number.isFinite(requestedCount) ? requestedCount : suppliedDays.length || 1),
  );

  return Array.from({ length: dayCount }, (_, dayIndex) => {
    const suppliedDay = suppliedDays[dayIndex];
    const fallbackDay: ScheduleDayName = '';
    const day = suppliedDay && scheduleDayNames.includes(suppliedDay.day)
      ? suppliedDay.day
      : fallbackDay;

    return {
      day,
      sessions: Array.from({ length: 5 }, (_, sessionIndex) => {
        const suppliedSession = suppliedDay?.sessions?.[sessionIndex];
        return {
          type: suppliedSession && scheduleSessionTypes.includes(suppliedSession.type)
            ? suppliedSession.type
            : '',
          time:
            typeof suppliedSession?.time === 'string'
              ? suppliedSession.time
              : '',
        };
      }),
    };
  });
}

export const starter: Data = {
  onboardingComplete: false,
  profile: {
    name: '',
    number: '',
    team: '',
  },
  branding: {
    primary: '#ef3b3b',
    secondary: '#111317',
    accent: '#ffffff',
    headingFont: 'Orbitron',
    bodyFont: 'Rajdhani',
    sponsorLogoScale: 1,
  },
  sponsors: [],
  projects: [],
};

type StoredData = Omit<Partial<Data>, 'profile' | 'projects'> & {
  profile?: DriverProfile & { heroImage?: unknown; carImage?: unknown };
  projects?: Array<Omit<Partial<Project>, 'template'> & { template?: string }>;
};

export type StorageIssue = {
  operation: 'load' | 'save';
  error: unknown;
};

export type LoadResult = {
  data: Data;
  issue?: StorageIssue;
};

export function normaliseData(value: unknown): Data {
  const parsed = (value && typeof value === 'object' ? value : {}) as StoredData;
  const profile: DriverProfile = {
    name: parsed.profile?.name || '',
    number: parsed.profile?.number || '',
    team: parsed.profile?.team || '',
  };
  if (parsed.profile?.driverImage) profile.driverImage = parsed.profile.driverImage;
  if (parsed.profile?.teamLogo) profile.teamLogo = parsed.profile.teamLogo;
  if (parsed.profile?.competitionLogo) {
    profile.competitionLogo = parsed.profile.competitionLogo;
  }

  const sponsorLogoScale = parsed.branding?.sponsorLogoScale;
  const headingFont = parsed.branding?.headingFont;
  const bodyFont = parsed.branding?.bodyFont;
  const branding = {
    ...starter.branding,
    ...parsed.branding,
    sponsorLogoScale: Number.isFinite(sponsorLogoScale)
      ? Math.min(1.4, Math.max(0.65, sponsorLogoScale as number))
      : 1,
    headingFont: MOTORSPORT_FONTS.some(font => font === headingFont)
      ? headingFont!
      : starter.branding.headingFont,
    bodyFont: MOTORSPORT_FONTS.some(font => font === bodyFont)
      ? bodyFont!
      : starter.branding.bodyFont,
  };

  const projects = (parsed.projects || [])
    .filter(project => project.template !== 'bio')
    .map(project => {
    const legacyQualifying = project.template === 'qualifying';
    const details: GraphicDetails = {
      ...emptyDetails,
      ...project.details,
      resultSession: legacyQualifying
        ? 'qualifying'
        : project.details?.resultSession === 'qualifying'
          ? 'qualifying'
          : 'race',
      raceNumber: ['1', '2', '3'].includes(String(project.details?.raceNumber))
        ? String(project.details?.raceNumber)
        : '1',
    };
    const scheduleDays = normaliseScheduleDays(details);

    return ({
    ...project,
    template: legacyQualifying ? 'results' : project.template,
    details: {
      ...details,
      scheduleDayCount: scheduleDays.length,
      scheduleDays,
    },
    driverX: Number.isFinite(project.driverX) ? project.driverX! : 0,
    driverY: Number.isFinite(project.driverY) ? project.driverY! : 0,
    driverScale: Number.isFinite(project.driverScale) ? project.driverScale! : 1,
    driverVisible: project.driverVisible !== false,
    exportedAt: typeof project.exportedAt === 'string' ? project.exportedAt : undefined,
    heroScale:
      Number.isFinite(project.heroScale) && project.heroScale! >= 1 ? project.heroScale! : 1,
    heroImageWidth: Number.isFinite(project.heroImageWidth) ? project.heroImageWidth! : 0,
    heroImageHeight: Number.isFinite(project.heroImageHeight) ? project.heroImageHeight! : 0,
    heroImage:
      typeof project.heroImage === 'string' && project.heroImage.length < 3000000
        ? project.heroImage
        : '',
    });
    }) as Project[];

  return { ...starter, ...parsed, profile, branding, projects };
}

export function loadResult(storage: Pick<Storage, 'getItem'> = localStorage): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return { data: raw ? normaliseData(JSON.parse(raw)) : starter };
  } catch (error) {
    return {
      data: starter,
      issue: { operation: 'load', error },
    };
  }
}

export function load(storage: Pick<Storage, 'getItem'> = localStorage): Data {
  return loadResult(storage).data;
}

export function save(
  data: Data,
  storage: Pick<Storage, 'setItem'> = localStorage,
  onError: (error: unknown) => void = error => {
    console.error('Media Factory could not save the latest change.', error);
  },
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    onError(error);
    return false;
  }
}

export function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
