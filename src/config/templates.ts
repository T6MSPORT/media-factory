import type { GraphicDetails, TemplateId } from '../types';

export interface TemplateFieldDefinition {
  key: keyof GraphicDetails;
  label: string;
  type?: 'text' | 'date' | 'time' | 'textarea';
  placeholder?: string;
}

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
  { id: 'schedule', name: 'Schedule', description: 'Publish session or race timings.' },
  {
    id: 'results',
    name: 'Results',
    description: 'Share a qualifying or numbered race result with podium styling.',
  },
  { id: 'sponsor', name: 'Sponsor Recognition', description: 'Thank and feature a partner.' },
] as const;

const raceFields: readonly TemplateFieldDefinition[] = [
  { key: 'round', label: 'Round(s)' },
  { key: 'circuit', label: 'Track name' },
  { key: 'date', label: 'Date', type: 'date' },
];

export const TEMPLATE_FIELDS: Record<
  TemplateId,
  readonly TemplateFieldDefinition[]
> = {
  event: raceFields,
  announcement: [
    {
      key: 'subheadline',
      label: 'Text',
      type: 'textarea',
      placeholder: 'Enter the announcement text',
    },
  ],
  schedule: [
    { key: 'circuit', label: 'Track name' },
    { key: 'round', label: 'Round(s)' },
  ],
  results: [
    { key: 'circuit', label: 'Track name' },
    { key: 'position', label: 'Position' },
  ],
  sponsor: [],
};

export const getTemplateDefinition = (templateId: TemplateId): TemplateDefinition => {
  const template = TEMPLATE_CATALOGUE.find(({ id }) => id === templateId);

  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  return template;
};
