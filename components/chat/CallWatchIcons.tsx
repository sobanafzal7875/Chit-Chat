const iconClass = 'h-5 w-5 shrink-0 text-[#FF781F]';

/** Minimal outline phone (orange). */
export function CallOutlineIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

/** Minimal watch-together: stacked frame + small play (orange). */
export function WatchTogetherOutlineIcon({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="4" y="5" width="11" height="8" rx="1.25" strokeWidth="1.75" />
      <rect x="9" y="10" width="11" height="8" rx="1.25" strokeWidth="1.75" />
      <path
        fill="currentColor"
        stroke="none"
        d="M14.25 13.5L17 15v-3l-2.75 1.5z"
      />
    </svg>
  );
}
