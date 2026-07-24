import type { TemplateId } from '../types';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
}

export const TEMPLATE_CATALOGUE: readonly TemplateDefinition[] = [
  { id: 'event', name: 'Event Poster', description: 'Promote your next race.' },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Share driver, team, partnership or season news.',
  },
  {
    id: 'bio',
    name: 'Driver Profile',
    description: 'Introduce yourself and your racing profile.',
  },
  { id: 'schedule', name: 'Schedule', description: 'Publish session or race timings.' },
  {
    id: 'qualifying',
    name: 'Qualifying Result',
    description: 'Share qualifying results; pole styling is added automatically for P1.',
  },
  {
    id: 'results',
    name: 'Race Result',
    description: 'Share race results; podium styling is added automatically for P1–P3.',
  },
  { id: 'sponsor', name: 'Sponsor Recognition', description: 'Thank and feature a partner.' },
] as const;

export const getTemplateDefinition = (templateId: TemplateId): TemplateDefinition => {
  const template = TEMPLATE_CATALOGUE.find(({ id }) => id === templateId);

  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  return template;
};
