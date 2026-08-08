import {
  LayoutDashboard, Users, Home, KanbanSquare, Calendar,
  CheckSquare, BarChart3, Mail, Settings, UserCog, Clock, CalendarDays,
  Contact as ContactIcon, Megaphone, type LucideIcon,
} from 'lucide-react';

export type PageKey =
  | 'dashboard' | 'leads' | 'properties' | 'deals'
  | 'appointments' | 'calendar' | 'tasks' | 'analytics' | 'campaigns'
  | 'marketing' | 'team' | 'attendance' | 'contacts' | 'settings';

export interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'properties', label: 'Properties', icon: Home },
  { key: 'deals', label: 'Deals Pipeline', icon: KanbanSquare },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'campaigns', label: 'Campaigns', icon: Mail },
  { key: 'marketing', label: 'Marketing', icon: Megaphone },
  { key: 'team', label: 'Team', icon: UserCog },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'contacts', label: 'Contacts', icon: ContactIcon },
  { key: 'settings', label: 'Settings', icon: Settings },
];
