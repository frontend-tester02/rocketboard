// Typed mock data for the header ChatPanel (Dashboard #2 [Chat]).
// Replaced by real conversations/socket in the Chat stage (53–57).

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
}

export const chatContacts: ChatContact[] = [
  { id: 'c1', name: 'Felecia Brown', online: true },
  { id: 'c2', name: 'Regina Cooper', online: true },
  { id: 'c3', name: 'Robert Edwards', online: false },
  { id: 'c4', name: 'Gloria Mckinney', online: true },
  { id: 'c5', name: 'Randall Fisher', online: false },
  { id: 'c6', name: 'Judith Black', online: true },
];

export interface ChatMessage {
  id: string;
  /** 'me' for the current user, otherwise the contact id. */
  from: 'me' | string;
  text: string;
  time: string;
}

// Conversation with the first (active) contact.
export const chatMessages: ChatMessage[] = [
  { id: 'm1', from: 'c1', text: 'Hey! Did you get a chance to review the finance report?', time: '09:12' },
  { id: 'm2', from: 'me', text: 'Morning! Yes, going through it now. Numbers look solid.', time: '09:14' },
  { id: 'm3', from: 'c1', text: 'Great. The income is up 53% this week 🎉', time: '09:15' },
  { id: 'm4', from: 'me', text: "That's fantastic. Let's sync the cards widget data after lunch.", time: '09:16' },
  { id: 'm5', from: 'c1', text: 'Sounds good. I will prepare the breakdown by category.', time: '09:17' },
];

/** The contact currently shown as typing, or null. */
export const typingContactId: string | null = 'c1';
