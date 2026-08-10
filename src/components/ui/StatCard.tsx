interface StatCardProps {
  value: number;
  label: string;
  onClick: () => void;
}

export function StatCard({ value, label, onClick }: StatCardProps) {
  return (
    <button type="button" className="stat stat-action" onClick={onClick}>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}
