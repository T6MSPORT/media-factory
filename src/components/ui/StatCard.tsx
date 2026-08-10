import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  value: number;
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ value, label, onClick, icon: Icon, className = '' }: StatCardProps) {
  return (
    <button type="button" className={`stat stat-action ${className}`.trim()} onClick={onClick}>
      <div className="stat-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      <div className="stat-graphic" aria-hidden="true">
        <Icon size={34} />
      </div>
    </button>
  );
}
