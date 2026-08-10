import type { PageId } from '../../config/navigation';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { LogOut, MoreHorizontal } from 'lucide-react';

const MOBILE_PRIMARY_PAGES: PageId[] = ['home', 'templates', 'exports', 'profile'];

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
  const mobilePrimary = NAVIGATION_ITEMS.filter(item => MOBILE_PRIMARY_PAGES.includes(item.id));
  const mobileMore = NAVIGATION_ITEMS.filter(item => !MOBILE_PRIMARY_PAGES.includes(item.id));

  return (
    <aside>
      <div className="logo">
        <span>MF</span>
        <div>
          <b>MEDIA FACTORY</b>
          <small>DRIVER GRAPHICS</small>
        </div>
      </div>
      <nav className="desktop-navigation" aria-label="Main navigation">
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
      <nav className="mobile-navigation" aria-label="Mobile navigation">
        {mobilePrimary.map(({ id, label, icon: Icon }) => (
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
        <details className="mobile-more">
          <summary className={mobileMore.some(item => item.id === activePage) ? 'active' : ''}>
            <MoreHorizontal aria-hidden="true" size={18} />
            More
          </summary>
          <div className="mobile-more-menu">
            {mobileMore.map(({ id, label, icon: Icon }) => (
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
          </div>
        </details>
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
