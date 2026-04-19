'use client';

import { Button } from '@/components/ui/button';

interface CallModalProps {
  receivingCall: boolean;
  caller: string;
  watchTogetherSession: any;
  onAnswerCall: () => void;
  onAnswerWatchTogether: () => void;
  onEndCall: () => void;
}

export function CallModal({
  receivingCall,
  caller,
  watchTogetherSession,
  onAnswerCall,
  onAnswerWatchTogether,
  onEndCall,
}: CallModalProps) {
  if (!receivingCall) return null;

  return (
    <div className="fixed top-10 right-10 z-50 bg-card p-6 rounded-xl shadow-2xl border border-border flex flex-col items-center animate-bounce">
      <h3 className="font-bold text-lg mb-2">
        {watchTogetherSession ? 'Watch Together Invitation' : 'Incoming Call...'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {watchTogetherSession ? `@${caller} invited you to watch together` : `@${caller} is calling you`}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={watchTogetherSession ? onAnswerWatchTogether : onAnswerCall}
          className="bg-green-600 hover:bg-green-700"
        >
          {watchTogetherSession ? 'Join' : 'Accept'}
        </Button>
        <Button onClick={onEndCall} variant="destructive">
          Decline
        </Button>
      </div>
    </div>
  );
}