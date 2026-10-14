// Typed mock data for the header NotificationsDropdown (Dashboard #3 [Notifications]).
// Replaced by the real /notifications module + socket in integration stage I2.

export type NotificationType =
  | 'message'
  | 'task'
  | 'order'
  | 'file'
  | 'mention';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  /** For message/mention types, the person's name drives an avatar. */
  actor?: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'message',
    actor: 'Felecia Brown',
    title: 'New message',
    description: 'Hey! Did you get a chance to review the finance report?',
    time: '2m ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'task',
    title: 'Task assigned',
    description: 'You were assigned to “Sync card balances with API”.',
    time: '18m ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'order',
    title: 'New order #790857',
    description: 'Gloria Mckinney placed an order for $5.000.',
    time: '1h ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'file',
    actor: 'Robert Edwards',
    title: 'Files uploaded',
    description: 'Added 3 files to the Projects workspace.',
    time: '3h ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'mention',
    actor: 'Regina Cooper',
    title: 'Mentioned you',
    description: 'Mentioned you in a comment on “Rocket Admin”.',
    time: 'Yesterday',
    read: true,
  },
];
