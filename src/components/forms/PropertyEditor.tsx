import type { ReactNode } from 'react';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'date' | 'time' | 'email' | 'password';
  readOnly?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  autoComplete,
  placeholder,
}: TextFieldProps) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
      />
    </label>
  );
}

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
};

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  children,
}: SelectFieldProps<T>) {
  return (
    <label>
      {label}
      <select value={value} onChange={event => onChange(event.target.value as T)}>
        {children}
      </select>
    </label>
  );
}

type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
};

export function RangeField({
  label,
  value,
  min,
  max,
  onChange,
  step,
}: RangeFieldProps) {
  return (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(+event.target.value)}
      />
    </label>
  );
}

type ToggleFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  return (
    <label className="toggle-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
