import { create } from 'zustand';
import { walletContacts, type PersonItem } from '@/features/dashboard/mock';

interface WalletContactsState {
  contacts: PersonItem[];
  addContact: (contact: Omit<PersonItem, 'id'>) => void;
}

/**
 * Client-side wallet contacts store, seeded from the mock. Replaced by the real
 * /contacts endpoints in the Contacts stage.
 */
export const useWalletContactsStore = create<WalletContactsState>((set) => ({
  contacts: walletContacts,
  addContact: (contact) =>
    set((state) => ({
      contacts: [{ ...contact, id: `wct-${Date.now()}` }, ...state.contacts],
    })),
}));
