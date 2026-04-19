'use client';

import { Button } from '@/components/ui/button';

interface ActiveCallUIProps {
  callAccepted: boolean;
  callEnded: boolean;
  calling: boolean;
  onEndCall: () => void;
}

export function ActiveCallUI({ callAccepted, callEnded, calling, onEndCall }: ActiveCallUIProps) {
  if (!callAccepted && !calling) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-green-900/90 text-white p-3 flex justify-between items-center px-10 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="font-semibold">{calling ? 'Calling...' : 'Active Audio Call'}</span>
      </div>
      <Button onClick={onEndCall} variant="destructive" size="sm" className="rounded-full">
        End Call
      </Button>
    </div>
  );
}