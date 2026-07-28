export const DRIVER_FIELDS = [
  'name',
  'number',
  'team',
] as const;

export const labelForDriverField = (key: string) =>
  ({
    name: 'Driver name',
    number: 'Car number',
    team: 'Team name',
  })[key] || key;
