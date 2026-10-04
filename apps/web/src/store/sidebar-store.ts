import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  /** Desktop: true → icon-rail (collapsed), false → full sidebar. */
  collapsed: boolean;
  /** Mobile: whether the drawer is open. */
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

/**
 * Sidebar UI state. The desktop collapsed flag is persisted to localStorage so
 * the chosen mode survives reloads; mobileOpen is session-only.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
    }),
    {
      name: 'rocket-sidebar',
      partialize: (state) => ({ collapsed: state.collapsed }),
    },
  ),
);
