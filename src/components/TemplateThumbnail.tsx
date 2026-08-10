import { CalendarDays, Flag, Handshake, Megaphone, Trophy } from 'lucide-react';
import type { TemplateId } from '../types';

const icons = {
  event: Flag,
  announcement: Megaphone,
  schedule: CalendarDays,
  results: Trophy,
  sponsor: Handshake,
} satisfies Record<TemplateId, typeof Flag>;

export function TemplateThumbnail({ id, name }: { id: TemplateId; name: string }) {
  const Icon = icons[id];
  return (
    <div className={`thumb ${id}`}>
      <div className="template-motif" aria-hidden="true">
        <Icon size={40} strokeWidth={1.7} />
      </div>
      <span>{name}</span>
    </div>
  );
}
