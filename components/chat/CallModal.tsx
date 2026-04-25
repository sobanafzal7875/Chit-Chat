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

  // return (
  //   <div className="fixed top-10 right-10 z-50 bg-card p-6 rounded-xl shadow-2xl border border-border flex flex-col items-center ">
  //     <h3 className="font-bold text-lg mb-2">
  //       {watchTogetherSession ? 'Watch Together Invitation' : 'Incoming Call...'}
  //     </h3>
  //     <p className="text-muted-foreground mb-4">
  //       {watchTogetherSession ? `@${caller} invited you to watch together` : `@${caller} is calling you`}
  //     </p>
  //     <div className="flex gap-4">
  //       <Button
  //         onClick={watchTogetherSession ? onAnswerWatchTogether : onAnswerCall}
  //         className="bg-green-600 hover:bg-green-700"
  //       >
  //         {watchTogetherSession ? 'Join' : 'Accept'}
  //       </Button>
  //       <Button onClick={onEndCall} variant="destructive">
  //         Decline
  //       </Button>
  //     </div>
  //   </div>
  // );
  return (
  <div className="fixed inset-x-4 top-6 sm:inset-auto sm:top-6 sm:right-6 sm:w-80 z-50 bg-[#1a1a1a] border border-[#3a3a3a] p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
    <div className="w-12 h-12 rounded-full bg-[#FF781F]/10 border border-[#FF781F]/30 flex items-center justify-center text-2xl">
      {watchTogetherSession ? '🎬' : '📞'}
    </div>
    <div className="text-center">
      <h3 className="font-bold text-base text-foreground">
        {watchTogetherSession ? 'Watch Together Invite' : 'Incoming Call'}
      </h3>
      <p className="text-sm text-muted-foreground mt-0.5">
        {watchTogetherSession
          ? `@${caller} invited you to watch together`
          : `@${caller} is calling you`}
      </p>
    </div>
    <div className="flex gap-3 w-full mt-1">
      <Button
        onClick={watchTogetherSession ? onAnswerWatchTogether : onAnswerCall}
        className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 font-semibold text-white"
      >
        {watchTogetherSession ? 'Join' : 'Accept'}
      </Button>
      <Button
        onClick={onEndCall}
        variant="destructive"
        className="flex-1 h-11 rounded-xl font-semibold"
      >
        Decline
      </Button>
    </div>
  </div>
);
}