import { create } from 'zustand';
import { walletCards, type WalletCard } from '@/features/dashboard/mock';

interface WalletCardsState {
  cards: WalletCard[];
  addCard: (card: Omit<WalletCard, 'id'>) => void;
}

/**
 * Client-side wallet cards store, seeded from the mock. Replaced by the real
 * /cards endpoints in integration stage I1.
 */
export const useWalletCardsStore = create<WalletCardsState>((set) => ({
  cards: walletCards,
  addCard: (card) =>
    set((state) => ({
      cards: [{ ...card, id: `wc-${Date.now()}` }, ...state.cards],
    })),
}));
