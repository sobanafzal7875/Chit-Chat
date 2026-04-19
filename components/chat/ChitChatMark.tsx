/** Minimal dual speech-bubble mark for the app title (outline on dark). */
export function ChitChatMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 9h12a3 3 0 013 3v7a3 3 0 01-3 3h-2l-4 4v-4H10a3 3 0 01-3-3v-7a3 3 0 013-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 17h12a3 3 0 013 3v6a3 3 0 01-3 3h-2l-3 3.5V29h-7a3 3 0 01-3-3v-6a3 3 0 013-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
