import type { PageId } from '../../config/navigation';
import { NAVIGATION_ITEMS } from '../../config/navigation';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={activePage === id ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => onNavigate(id)}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
