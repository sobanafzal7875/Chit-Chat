'use client';

import dynamic from 'next/dynamic';
import { ChatLoadingSkeleton } from '@/components/chat/ChatLoadingSkeleton';

const ChatPageClient = dynamic(() => import('./ChatPageClient'), {
  ssr: false,
  loading: () => <ChatLoadingSkeleton />,
});

export function ChatEntry() {
  return <ChatPageClient />;
}
