interface StatCardProps {
  value: number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
