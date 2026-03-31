/** Padlock + keyhole — “click to explore” hint on About gallery */
export function PadlockExploreIcon({ className }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path d="M9 11V6a3 3 0 0 1 6 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M15 11h.01M9 11H8a3 3 0 0 0-3 3v1a7 7 0 0 0 14 0v-4a1 1 0 0 0-2 0v-1a1 1 0 0 0-2 0v-1a1 1 0 0 0-1-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
