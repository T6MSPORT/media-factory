import type { FormatId } from '../types';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export const getCanvasDimensions = (format: FormatId): CanvasDimensions =>
  format === 'story' ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 };

const parseEventDate = (value: string): Date | null => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatEventDate = (value: string): string => {
  if (!value) return 'DATE';

  const date = parseEventDate(value);
  if (!date) return value.toUpperCase();

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
    .format(date)
    .toUpperCase();
};

export const formatEventDateRange = (start: string, end?: string): string => {
  if (!end || end === start) return formatEventDate(start);

  const startDate = parseEventDate(start);
  const endDate = parseEventDate(end);
  if (!startDate || !endDate || endDate < startDate) {
    return formatEventDate(start);
  }

  const startMonth = startDate.getUTCMonth();
  const endMonth = endDate.getUTCMonth();
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();
  const dayFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    timeZone: 'UTC',
  });

  if (startMonth === endMonth && startYear === endYear) {
    const monthFormatter = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      timeZone: 'UTC',
    });
    return `${dayFormatter.format(startDate)}–${dayFormatter.format(endDate)} ${monthFormatter.format(endDate)}`.toUpperCase();
  }

  return `${formatEventDate(start)} – ${formatEventDate(end)}`;
};

export const toSafeFileName = (value: string): string =>
  value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'graphic';
