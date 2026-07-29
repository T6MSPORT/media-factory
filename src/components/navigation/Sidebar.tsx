import type { PageId } from '../../config/navigation';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  accountEmail?: string;
  onSignOut?: () => void;
}

export function Sidebar({
  activePage,
  onNavigate,
  accountEmail,
  onSignOut,
}: SidebarProps) {
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
      <div className="aside-foot">
        {accountEmail && <span title={accountEmail}>{accountEmail}</span>}
        <small>Individual driver plan · v3.5</small>
        {onSignOut && (
          <button type="button" onClick={onSignOut}>
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
