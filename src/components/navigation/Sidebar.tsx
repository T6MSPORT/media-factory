import type { PageId } from '../../config/navigation';
import { NAVIGATION_ITEMS } from '../../config/navigation';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside>
      <div className="logo">
        <span>MF</span>
        <div>
          <b>MEDIA FACTORY</b>
          <small>DRIVER GRAPHICS</small>
        </div>
      </div>
      <nav aria-label="Main navigation">
        {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={activePage === id ? 'active' : ''}
            onClick={() => onNavigate(id)}
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="aside-foot">Individual driver plan · v3.5</div>
    </aside>
  );
}
