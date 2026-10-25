"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useUserData } from "@/utils/userQuery";
import Login from "./Login";

/* -------------------------------------------------------------------------- */
/*  Edit these to match your product                                          */
/* -------------------------------------------------------------------------- */

const BRAND = "ProductiveX";
const LOGIN_HREF = "/login";
const SIGNUP_HREF = "/signup";
const DASHBOARD_HREF = '/dashboard'

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Focus", href: "#focus" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]";

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string };

function svgProps(className?: string) {
  return {
    className,
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)} strokeWidth={2.6}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function TasksIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 12.2l2.4 2.4 4.6-4.9" />
    </svg>
  );
}

function FlameIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 3c.5 3-1.5 4.5-3 6.5C7.6 11.3 7 12.7 7 14.2A5 5 0 0 0 12 19a5 5 0 0 0 5-4.8c0-2-1-3.4-2-4.6.1 1.2-.4 2-1.2 2.4C14.2 9.5 13.6 5.5 12 3z" />
    </svg>
  );
}

function TimerIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9v4l2.5 1.5M9.5 3h5" />
    </svg>
  );
}

function ArrowIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)} width={16} height={16} strokeWidth={2.4}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg {...svgProps()} strokeWidth={2.2}>
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-[#242521] text-[#f16f3a] shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.6" strokeOpacity="0.35" />
          <path d="M12 4a8 8 0 0 1 8 8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-[-0.4px] text-[#242521]">{BRAND}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                   */
/* -------------------------------------------------------------------------- */

function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f16f3a] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.98] ${focusRing} ${className}`}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e4e2db] bg-white px-6 text-sm font-bold text-[#34352f] transition hover:bg-[#f4f3ef] active:scale-[0.98] ${focusRing} ${className}`}
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function Header() {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError } = useUserData();
  console.log(data?.username)
  const isLoggedIn = !isPending && !isError && data?.login === true;

if(isPending){
  return <>
    <header className="flex h-[78px] items-center justify-between border-b border-[#ebe9e3] px-8">
       
        
      </header>
  </>
}



  return (
    <header className="sticky top-0 z-50 border-b border-[#ecebe5] bg-[#fbfaf7]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label={`${BRAND} home`} className={`rounded-lg ${focusRing}`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-[#77786f] transition hover:bg-[#efeee9] hover:text-[#242521] ${focusRing}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        {isLoggedIn?
          
          <div className="hidden items-center gap-2 md:flex">
          <Link
            href={DASHBOARD_HREF}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold text-[#34352f] transition hover:bg-[#efeee9] ${focusRing}`}
          >
              Dashboard
            </Link>
          
        </div>

        :<div className="hidden items-center gap-2 md:flex">
          <Link
            href={LOGIN_HREF}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold text-[#34352f] transition hover:bg-[#efeee9] ${focusRing}`}
          >
            Log in
          </Link>
          <Link
            href={SIGNUP_HREF}
            className={`rounded-xl bg-[#242521] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#383932] active:scale-[0.98] ${focusRing}`}
          >
            Sign up
          </Link>
        </div>}
     
        

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className={`grid size-11 place-items-center rounded-xl text-[#34352f] transition hover:bg-[#efeee9] md:hidden ${focusRing}`}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-[#ecebe5] bg-[#fbfaf7] px-4 pb-5 pt-3 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3.5 text-base font-semibold text-[#34352f] hover:bg-[#efeee9]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <SecondaryLink href={LOGIN_HREF}>Log in</SecondaryLink>
            <PrimaryLink href={SIGNUP_HREF}>Sign up</PrimaryLink>
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero preview (decorative mock of the product)                             */
/* -------------------------------------------------------------------------- */

function ProductPreview() {
  const weekCells = [true, true, true, false, false, null, null];

  return (
    <div aria-hidden="true" className="relative mx-auto mt-14 max-w-[1040px] sm:mt-16">
      <div className="pointer-events-none absolute inset-x-10 -top-6 h-40 rounded-full bg-[#f16f3a]/15 blur-3xl" />

      <div className="relative rounded-[28px] border border-[#e7e5df] bg-[#f4f3ef] p-3 shadow-[0_30px_80px_rgba(39,39,32,0.12)] sm:rounded-[34px] sm:p-5">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-[1.1fr_1fr]">
          {/* Today */}
          <div className="relative overflow-hidden rounded-[22px] bg-[#242521] p-5 text-white sm:p-6">
            <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-[#f16f3a]/20 blur-3xl" />
            <div className="relative flex items-center gap-5">
              <div className="relative size-[88px] shrink-0">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#f16f3a"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="276.5"
                    strokeDashoffset="110"
                  />
                </svg>
                <p className="absolute inset-0 grid place-items-center text-xl font-extrabold">
                  3<span className="text-sm text-white/45">/5</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/55">Today</p>
                <p className="mt-1 text-lg font-extrabold leading-tight">2 habits left today</p>
                <p className="mt-1 text-xs text-white/55">You’re on a 12 day streak.</p>
              </div>
            </div>

            <div className="relative mt-5 rounded-2xl bg-white/[0.07] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/60">Focus session</p>
                <p className="text-[11px] font-bold text-[#f16f3a]">Running</p>
              </div>
              <p className="mt-1 text-[34px] font-extrabold tabular-nums tracking-[-2px]">18:42</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[26%] rounded-full bg-[#f16f3a]" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {/* Tasks */}
            <div className="rounded-[22px] border border-[#e7e5df] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#30312c]">Today’s tasks</p>
                <span className="rounded-md bg-[#f4f3ef] px-2 py-0.5 text-[11px] font-bold text-[#9a9b95]">3</span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {[
                  { t: "Draft project outline", done: true },
                  { t: "Review pull requests", done: false },
                  { t: "Plan next week", done: false },
                ].map((item) => (
                  <li key={item.t} className="flex items-center gap-3 rounded-xl border border-[#efede8] px-3 py-2.5">
                    <span
                      className={`grid size-5 place-items-center rounded-md border ${
                        item.done ? "border-[#b9dfcb] bg-[#e8f5ee] text-[#398260]" : "border-[#d8d7d1]"
                      }`}
                    >
                      {item.done && <CheckIcon className="size-3" />}
                    </span>
                    <span
                      className={`text-[13px] font-bold ${
                        item.done ? "text-[#9b9c96] line-through" : "text-[#3b3c37]"
                      }`}
                    >
                      {item.t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Habit */}
            <div className="rounded-[22px] border border-[#e7e5df] bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#8270c7] text-white">
                  <FlameIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-extrabold text-[#34352f]">Read 20 pages</p>
                  <p className="text-[11px] font-semibold text-[#a1a29c]">Every day</p>
                </div>
                <span className="rounded-full bg-[#fff0e9] px-2.5 py-1 text-[11px] font-extrabold text-[#e96330]">
                  12d
                </span>
              </div>
              <div className="mt-4 flex gap-1.5">
                {weekCells.map((state, index) => (
                  <span
                    key={index}
                    className={`grid h-9 flex-1 place-items-center rounded-lg border text-[11px] font-bold ${
                      state === true
                        ? "border-transparent bg-[#8270c7] text-white"
                        : state === false
                          ? "border-[#f16f3a]/50 bg-[#faf9f6] text-[#b2b3ad]"
                          : "border-dashed border-[#e6e4de] text-[#c9cac4]"
                    }`}
                  >
                    {state === true ? <CheckIcon className="size-3.5" /> : "MTWTFSS"[index]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                  */
/* -------------------------------------------------------------------------- */

const FEATURES: {
  title: string;
  text: string;
  points: string[];
  icon: ReactNode;
  tint: string;
  iconBg: string;
  border: string;
}[] = [
  {
    title: "Tasks",
    text: "See everything on your plate in a clean board, then narrow it down to what matters right now.",
    points: ["To do, in progress and completed columns", "Filter by today, tomorrow or upcoming", "Due dates, descriptions and quick edits"],
    icon: <TasksIcon />,
    tint: "bg-white",
    iconBg: "bg-[#4ba67b]",
    border: "border-[#e7e5df]",
  },
  {
    title: "Habits",
    text: "Build routines that stick with a weekly view that makes progress obvious at a glance.",
    points: ["Daily, weekday, custom or times-per-week schedules", "Streaks that follow your own schedule", "A weekly score so you know how you’re doing"],
    icon: <FlameIcon />,
    tint: "bg-white",
    iconBg: "bg-[#f16f3a]",
    border: "border-[#e7e5df]",
  },
  {
    title: "Focus timer",
    text: "Work in focused bursts with a timer that stays accurate, and see how much deep work you’ve done today.",
    points: ["Pomodoro, short break, long break or custom", "Ambient rain, forest and café sounds", "Completed sessions saved to today’s total"],
    icon: <TimerIcon />,
    tint: "bg-white",
    iconBg: "bg-[#8270c7]",
    border: "border-[#e7e5df]",
  },
];

const STEPS = [
  { n: "01", title: "Plan your day", text: "Capture tasks and set the habits you want to keep. Everything lives in one place." },
  { n: "02", title: "Start a focus session", text: "Pick a timer, add some ambient sound and work without switching apps." },
  { n: "03", title: "Watch it add up", text: "Tick things off, grow your streaks and see your focus time build through the week." },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-[#f16f3a]">Everything in one place</p>
          <h2 className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-1px] text-[#242521] sm:text-[40px]">
            Three tools. One calm workspace.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#77786f]">
            Stop juggling apps. {BRAND} brings your tasks, habits and focus time together so your day makes sense.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={`flex flex-col rounded-[26px] border p-6 shadow-[0_8px_30px_rgba(40,40,35,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(40,40,35,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-7 ${feature.tint} ${feature.border}`}
            >
              <span className={`grid size-12 place-items-center rounded-2xl text-white shadow-[0_8px_18px_rgba(40,40,35,0.16)] ${feature.iconBg}`}>
                {feature.icon}
              </span>
              <h3 className="mt-5 text-xl font-extrabold tracking-[-0.4px] text-[#30312c]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#77786f]">{feature.text}</p>
              <ul className="mt-5 space-y-2.5 border-t border-[#f0eee9] pt-5">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm font-semibold leading-5 text-[#55564f]">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#4ba67b]" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FocusShowcase() {
  return (
    <section id="focus" className="scroll-mt-20 px-4 sm:px-8">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[30px] bg-[#242521] px-6 py-12 text-white sm:rounded-[36px] sm:px-14 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#f16f3a]/15 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-[#f16f3a]">Deep work, made easy</p>
            <h2 className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-1px] sm:text-[40px]">
              Focus first. Everything else follows.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-white/60">
              Start a session, let the ambient sound settle in and keep going. Your finished sessions add up to a clear picture of the day.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href={SIGNUP_HREF}>
                Try the focus timer
                <ArrowIcon />
              </PrimaryLink>
            </div>
          </div>

          <div aria-hidden="true" className="mx-auto grid place-items-center">
            <div className="relative grid size-[240px] place-items-center rounded-full border-[7px] border-white/10 sm:size-[280px]">
              <svg className="absolute inset-[-7px] size-[calc(100%+14px)] -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="#f16f3a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="190 296"
                  style={{ filter: "drop-shadow(0 0 2.5px rgba(241,111,58,0.65))" }}
                />
              </svg>
              <div className="text-center">
                <p className="text-[54px] font-extrabold tabular-nums tracking-[-3px] sm:text-[62px]">16:20</p>
                <p className="text-xs font-bold text-white/55">Focus session</p>
                <p className="mt-1.5 text-[11px] text-white/35">Stay in the zone</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-[#f16f3a]">How it works</p>
          <h2 className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-1px] text-[#242521] sm:text-[40px]">
            From messy to mindful in three steps
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-[26px] border border-[#e7e5df] bg-white p-6 sm:p-7">
              <span className="text-[34px] font-extrabold leading-none tracking-[-1.5px] text-[#f16f3a]/80">{step.n}</span>
              <h3 className="mt-5 text-lg font-extrabold text-[#30312c]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#77786f]">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FinalCta() {

  
  const { data, isPending, isError } = useUserData();
  console.log(data?.username)
  const isLoggedIn = !isPending && !isError && data?.login === true;

      if(isPending){
        return <>
          <header className="flex h-[78px] items-center justify-between border-b border-[#ebe9e3] px-8">
            
              
            </header>
        </>
      }


  return (
    <section className="px-4 pb-20 sm:px-8 sm:pb-28">
      <div className="mx-auto max-w-[1200px] rounded-[30px] border border-[#f3dccf] bg-[#fff0e9] px-6 py-12 text-center sm:rounded-[36px] sm:px-14 sm:py-16">
        <h2 className="mx-auto max-w-xl text-[30px] font-extrabold leading-[1.1] tracking-[-1px] text-[#242521] sm:text-[40px]">
          Ready to make your days count?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#8f7366]">
          Create your account in a minute and start planning, building habits and focusing.
        </p>
        {data?.login && <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <PrimaryLink href={DASHBOARD_HREF}>
            Dashboard
            <ArrowIcon />
          </PrimaryLink>
        </div>} 
        {!data?.login && <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <PrimaryLink href={SIGNUP_HREF}>
            Create your account
            <ArrowIcon />
          </PrimaryLink>
          <SecondaryLink href={LOGIN_HREF}>I already have an account</SecondaryLink>
        </div>}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#ecebe5] px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={`rounded text-sm font-semibold text-[#77786f] hover:text-[#242521] ${focusRing}`}>
              {link.label}
            </a>
          ))}
         
        </nav>
        <p className="text-xs font-semibold text-[#a0a19b]">
          © {new Date().getFullYear()} {BRAND}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HomePage() {

  const { data, isPending, isError } = useUserData();
  console.log(data?.username)
  const isLoggedIn = !isPending && !isError && data?.login === true;



  return (
    <div className="min-h-screen scroll-smooth bg-[#fbfaf7] text-[#242521] antialiased">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-[#f16f3a]/[0.08] blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#e7e5df] bg-white px-3.5 py-1.5 text-xs font-bold text-[#77786f] shadow-sm">
              <span className="size-1.5 rounded-full bg-[#4ba67b]" />
              Tasks, habits and focus in one app
            </p>

            <h1 className="mt-6 text-[40px] font-extrabold leading-[1.04] tracking-[-2px] text-[#242521] sm:text-[64px] sm:tracking-[-3px]">
              Plan your day.
              <br />
              Build your habits.
              <br />
              <span className="text-[#f16f3a]">Stay in focus.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#77786f] sm:text-lg sm:leading-8">
              {BRAND} is a calm, all-in-one workspace for the things that move your life forward. Manage tasks, keep streaks alive and get deep work done.
            </p>

            {data?.login && <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <PrimaryLink href={DASHBOARD_HREF}>
              Dashboard
              <ArrowIcon />
            </PrimaryLink>
            </div>
            }

            {!data?.login && <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <PrimaryLink href={SIGNUP_HREF}>
              Get started
              <ArrowIcon />
            </PrimaryLink>
            <SecondaryLink href={LOGIN_HREF}>Log in</SecondaryLink>
            </div>}
           
          </div>

          <ProductPreview />
        </section>

        <Features />
        <FocusShowcase />
        <HowItWorks />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}