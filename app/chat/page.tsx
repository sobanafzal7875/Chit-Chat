import type { Metadata } from 'next';
import { ChatEntry } from './ChatEntry';

export const metadata: Metadata = {
  title: 'Chat · ChitChat',
  description: 'Your conversations and calls in one place.',
};

export default function ChatPage() {
  return <ChatEntry />;
}
