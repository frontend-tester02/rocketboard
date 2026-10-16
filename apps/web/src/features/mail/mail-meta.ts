import { MailFolder } from '@rocket/shared';
import {
  Inbox,
  Send,
  File,
  Trash2,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

export const folders: {
  value: MailFolder;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: MailFolder.Inbox, label: 'Inbox', icon: Inbox },
  { value: MailFolder.Sent, label: 'Sent', icon: Send },
  { value: MailFolder.Draft, label: 'Drafts', icon: File },
  { value: MailFolder.Spam, label: 'Spam', icon: ShieldAlert },
  { value: MailFolder.Trash, label: 'Trash', icon: Trash2 },
];
