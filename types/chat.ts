export type GroupCreationStep = 'select' | 'name';

export interface ChatUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  dp?: string;
  isGroup?: boolean;
  members?: { username: string; name?: string; dp?: string }[];
}

export interface ChatListItem {
  id: string;
  username?: string;
  name?: string;
  dp?: string;
  unreadCount: number;
  isGroup?: boolean;
  lastMessage?: { content?: string; fileUrl?: string; unsent?: boolean };
  members?: { username: string; name?: string; dp?: string }[];
}

export interface ChatMessage {
  _id: string;
  content?: string;
  sender: string | { username: string; name?: string; dp?: string };
  receiver?: string;
  groupId?: string;
  createdAt: string;
  read: boolean;
  fileUrl?: string;
  fileType?: string;
  unsent?: boolean;
}
