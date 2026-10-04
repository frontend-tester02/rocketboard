import {
  Calendar,
  Contact,
  FolderKanban,
  HardDrive,
  LayoutDashboard,
  Mail,
  MessageSquare,
  type LucideIcon,
  ShoppingBag,
  StickyNote,
  CheckSquare,
} from 'lucide-react';

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  /** Unread/count badge shown next to the label. */
  badge?: number;
  badgeVariant?: 'default' | 'danger';
  children?: NavChild[];
}

/** Sidebar navigation model. One source of truth for sidebar + mobile drawer. */
export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'E-Commerce',
    icon: ShoppingBag,
    children: [
      { label: 'Products', href: '/ecommerce/products' },
      { label: 'Orders', href: '/ecommerce/orders' },
      { label: 'Customers', href: '/ecommerce/customers' },
    ],
  },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Mail', href: '/mail', icon: Mail, badge: 2, badgeVariant: 'danger' },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'File Manager', href: '/files', icon: HardDrive },
  { label: 'Notes', href: '/notes', icon: StickyNote },
  { label: 'Contacts', href: '/contacts', icon: Contact },
];
