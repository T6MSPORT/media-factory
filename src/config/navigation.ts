import type { LucideIcon } from 'lucide-react';
import {
  FolderKanban,
  LayoutTemplate,
  Palette,
  UserRound,
  UsersRound,
} from 'lucide-react';

export type PageId =
  | 'home'
  | 'templates'
  | 'profile'
  | 'branding'
  | 'sponsors'
  | 'saved'
  | 'builder';

export interface NavigationItem {
  id: Exclude<PageId, 'builder'>;
  label: string;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { id: 'home', label: 'Home', icon: FolderKanban },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'sponsors', label: 'Sponsors', icon: UsersRound },
  { id: 'saved', label: 'Saved Graphics', icon: FolderKanban },
] as const;
