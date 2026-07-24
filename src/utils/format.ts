import type { FormatId } from '../types';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export const getCanvasDimensions = (format: FormatId): CanvasDimensions =>
  format === 'story' ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 };

export const formatEventDate = (value: string): string => {
  if (!value) return 'DATE';

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value.toUpperCase();

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .toUpperCase();
};

export const toSafeFileName = (value: string): string =>
  value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'graphic';
