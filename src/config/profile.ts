export const DRIVER_FIELDS = ['name', 'number', 'team', 'car', 'location', 'age'] as const;

export const labelForDriverField = (key: string) =>
  ({
    name: 'Driver name',
    number: 'Car number',
    team: 'Team name',
    car: 'Car make/model',
    location: 'Location',
    age: 'Age',
  })[key] || key;
