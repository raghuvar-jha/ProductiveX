import type { ReactNode } from "react";
import type { IconName } from "../types/IconName";

export default function Icon({ name, size = 18 }: { name: IconName, size?: number }) {
  const paths: Record<IconName, ReactNode> = {

    lock: (
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
),

arrowright: (
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>
),

logout: (
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </>
),

login: (
  <>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </>
),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-6h6v6" />
      </>
    ),
    task: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="m3 6 1.5 1.5L7 4.5M3 12l1.5 1.5L7 10.5M3 18l1.5 1.5L7 16.5" />
      </>
    ),

    rotate: (
  <path d="M3 2v6h6M3.05 13a9 9 0 1 0 2.64-7.36L3 8" />
),

    playT: (
      <polygon points="6 3 20 12 6 21 6 3" />
    ),
    
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </>
    ),

    cards: (
      <>
        <rect x="4" y="3" width="16" height="14" rx="2" />
        <path d="M8 21h8M8 7h8M8 11h5" />
      </>
    ),
    timer: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v5l3 2M9 2h6" />
      </>
    ),
    habit: (
      <>
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="m8 15 2 2 5-5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    play: <path d="m9 6 9 6-9 6Z" fill="currentColor" stroke="none" />,
    check: <path d="m5 12 4 4L19 6" />,
    flame: (
      <path d="M13 3s1 4-2 6c-2-2-1-5-1-5s-6 4-6 10a8 8 0 0 0 16 0c0-4-2-7-4-9 0 4-2 5-2 5s0-4-1-7Z" />
    ),
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    book: (
      <>
        <path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2Z" />
        <path d="M20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2Z" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V4h6v3M3 12h18" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}
