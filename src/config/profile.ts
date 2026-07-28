export const DRIVER_FIELDS = [
  'name',
  'number',
  'team',
  'car',
  'location',
  'age',
  'optionalInfo1',
  'optionalInfo2',
  'optionalInfo3',
] as const;

export const labelForDriverField = (key: string) =>
  ({
    name: 'Driver name',
    number: 'Car number',
    team: 'Team name',
    car: 'Car make/model',
    location: 'Location',
    age: 'Age',
    optionalInfo1: 'Optional info 1',
    optionalInfo2: 'Optional info 2',
    optionalInfo3: 'Optional info 3',
  })[key] || key;
