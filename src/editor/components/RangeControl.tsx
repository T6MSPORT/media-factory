export interface RangeControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  className = '',
}: RangeControlProps) {
  return (
    <div className={className}>
      <div>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{`${value}${unit}`}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}
