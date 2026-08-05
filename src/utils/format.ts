import type { FormatId, Project } from '../types';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export const getOutputDimensions = (
  format: FormatId,
  customWidth = 1080,
  customHeight = 1080,
): CanvasDimensions => {
  if (format === 'story') return { width: 1080, height: 1920 };
  if (format === 'feed') return { width: 1080, height: 1350 };
  if (format === 'square') return { width: 1080, height: 1080 };
  return {
    width: Math.min(4096, Math.max(320, Math.round(customWidth || 1080))),
    height: Math.min(4096, Math.max(320, Math.round(customHeight || 1080))),
  };
};

export const getCanvasDimensions = (
  formatOrProject: FormatId | Pick<Project, 'format'|'customWidth'|'customHeight'>,
): CanvasDimensions => {
  const format = typeof formatOrProject === 'string'
    ? formatOrProject
    : formatOrProject.format;
  const output = getOutputDimensions(
    format,
    typeof formatOrProject === 'string' ? 1080 : formatOrProject.customWidth,
    typeof formatOrProject === 'string' ? 1080 : formatOrProject.customHeight,
  );
  const aspect = output.width / output.height;
  return aspect >= 1
    ? { width: 1080 * aspect, height: 1080 }
    : { width: 1080, height: 1080 / aspect };
};

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
    return `${dayFormatter.format(startDate)}-${dayFormatter.format(endDate)} ${monthFormatter.format(endDate)}`.toUpperCase();
  }

  return `${formatEventDate(start)}-${formatEventDate(end)}`;
};

export const formatSavedGraphicDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(date);
};

export const toSafeFileName = (value: string): string =>
  value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'graphic';
