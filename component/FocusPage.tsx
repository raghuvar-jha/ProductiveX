"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import PageHeading from "./PageHeading";
import SectionTitle from "./SectionTitle";

import {
  useCreateFocusSession,
  useFocusSessions,
} from "@/features/timer/query";

import type {
  AmbientSound,
  FocusMode,
} from "@/features/timer/types";

type FocusPageProps = {
  compact: boolean;
};

const MODES: {
  id: FocusMode;
  label: string;
  duration: number;
}[] = [
  { id: "pomodoro", label: "Pomodoro", duration: 25 * 60 },
  { id: "shortBreak", label: "Short break", duration: 5 * 60 },
  { id: "longBreak", label: "Long break", duration: 15 * 60 },
];

const SOUNDS: {
  id: Exclude<AmbientSound, "none">;
  label: string;
}[] = [
  { id: "rain", label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "cafe", label: "Café" },
];

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getTodayStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

/* -------------------------------------------------------------------------- */
/*  Presentational pieces (no logic)                                          */
/* -------------------------------------------------------------------------- */

const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#242521]";
const focusRingLight =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4.5" height="14" rx="1.4" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.4" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 5.8v12.4a1 1 0 0 0 1.55.83l8.4-6.2a1 1 0 0 0 0-1.66l-8.4-6.2A1 1 0 0 0 5 5.8z" />
      <rect x="17" y="5" width="2.6" height="14" rx="1.1" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FocusPage({ compact }: FocusPageProps) {
  const [mode, setMode] = useState<FocusMode>("pomodoro");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const [customEnabled, setCustomEnabled] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("25");
  const [customSeconds, setCustomSeconds] = useState("00");
  const [customDuration, setCustomDuration] = useState(25 * 60);
  const [showCustom, setShowCustom] = useState(false);
  const [customError, setCustomError] = useState("");

  const [sound, setSound] = useState<AmbientSound>("none");
  const [soundError, setSoundError] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);

  const { data: sessions = [] } = useFocusSessions();
  const createSession = useCreateFocusSession();

  const selectedMode =
    MODES.find((item) => item.id === mode) ?? MODES[0];

  const totalDuration = customEnabled
    ? customDuration
    : selectedMode.duration;

  const progress =
    totalDuration > 0
      ? Math.min(1, Math.max(0, (totalDuration - remaining) / totalDuration))
      : 0;

  const circumference = 2 * Math.PI * 47;

  // Count saved Pomodoro sessions completed today.
  const todayStats = useMemo(() => {
    const todayStart = getTodayStart();
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const todaysSessions = sessions.filter((session) => {
      if (session.mode !== "pomodoro") return false;

      const completedAt = new Date(session.completedAt).getTime();

      return (
        Number.isFinite(completedAt) &&
        completedAt >= todayStart &&
        completedAt < tomorrowStart.getTime()
      );
    });

    return {
      completedSessions: todaysSessions.length,
      totalFocusSeconds: todaysSessions.reduce(
        (total, session) => total + session.durationSeconds,
        0
      ),
    };
  }, [sessions]);

  // Include the elapsed time of the current focus session.
  // This makes today's focus update while the timer is running or paused.
  const currentFocusSeconds =
    hasStarted && mode === "pomodoro"
      ? Math.max(0, totalDuration - remaining)
      : 0;

  const todayFocusSeconds =
    todayStats.totalFocusSeconds + currentFocusSeconds;

  const todayMinutes = Math.floor(todayFocusSeconds / 60);
  const todayHours = Math.floor(todayMinutes / 60);
  const remainingMinutes = todayMinutes % 60;

  const formattedFocusTime =
    todayHours > 0
      ? `${todayHours}h ${remainingMinutes}m`
      : `${todayMinutes}m`;

  // Timer countdown. endAt keeps it accurate when browser ticks are delayed.
  useEffect(() => {
    if (!running || endAt === null) return;

    const interval = window.setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((endAt - Date.now()) / 1000)
      );

      setRemaining(secondsLeft);

      if (secondsLeft <= 0) {
        window.clearInterval(interval);

        setRunning(false);
        setEndAt(null);
        setHasStarted(false);

        if (mode === "pomodoro") {
          createSession.mutate(
            {
              mode: "pomodoro",
              durationSeconds: totalDuration,
            },
            {
              onSuccess: () => {
                setSessionMessage("Focus session completed. Great work!");
              },
              onError: () => {
                setSessionMessage(
                  "Timer finished, but saving failed. Please check your storage."
                );
              },
            }
          );
        } else {
          setSessionMessage(`${selectedMode.label} completed.`);
        }
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [
    running,
    endAt,
    mode,
    totalDuration,
    selectedMode.label,
    createSession.mutate,
  ]);

  // Ambient noise generated with Web Audio API.
  useEffect(() => {
    if (sound === "none") {
      const existingContext = audioContextRef.current;

      if (existingContext) {
        void existingContext.close();
        audioContextRef.current = null;
      }

      setSoundError(false);
      return;
    }

    let context: AudioContext | null = null;
    let source: AudioBufferSourceNode | null = null;

    try {
      context = new window.AudioContext();
      audioContextRef.current = context;

      const buffer = context.createBuffer(
        1,
        context.sampleRate * 2,
        context.sampleRate
      );

      const channel = buffer.getChannelData(0);
      let lastSample = 0;

      for (let index = 0; index < channel.length; index++) {
        const white = Math.random() * 2 - 1;
        lastSample = (lastSample + 0.035 * white) / 1.035;
        channel[index] = lastSample * 3.5;
      }

      source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      if (sound === "rain") {
        filter.type = "lowpass";
        filter.frequency.value = 1800;
        gain.gain.value = 0.45;
      } else if (sound === "forest") {
        filter.type = "lowpass";
        filter.frequency.value = 650;
        gain.gain.value = 0.6;
      } else {
        filter.type = "bandpass";
        filter.frequency.value = 900;
        filter.Q.value = 0.5;
        gain.gain.value = 0.5;
      }

      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      void context.resume();
      source.start();

      setSoundError(false);
    } catch {
      setSoundError(true);

      if (context) void context.close();

      audioContextRef.current = null;
    }

    return () => {
      if (source) {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // The source may already have stopped.
        }
      }

      if (context) void context.close();

      if (audioContextRef.current === context) {
        audioContextRef.current = null;
      }
    };
  }, [sound]);

  function resetTimerState(nextDuration: number) {
    setRunning(false);
    setEndAt(null);
    setHasStarted(false);
    setRemaining(nextDuration);
    setSessionMessage("");
  }

  function handleModeChange(nextMode: FocusMode) {
    setMode(nextMode);
    setCustomEnabled(false);
    setShowCustom(false);
    setCustomError("");

    const nextDuration =
      MODES.find((item) => item.id === nextMode)?.duration ??
      MODES[0].duration;

    resetTimerState(nextDuration);
  }

  function handleOpenCustom() {
    setMode("pomodoro");
    setCustomEnabled(true);
    setShowCustom((previous) => !previous);
    setCustomError("");
    setSessionMessage("");

    setRunning(false);
    setEndAt(null);
    setHasStarted(false);
    setRemaining(customDuration);
  }

  function handleApplyCustom() {
    const minutes = Number(customMinutes);
    const seconds = Number(customSeconds);

    if (
      customMinutes.trim() === "" ||
      customSeconds.trim() === "" ||
      !Number.isInteger(minutes) ||
      !Number.isInteger(seconds) ||
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59 ||
      minutes > 180 ||
      minutes * 60 + seconds < 1 ||
      minutes * 60 + seconds > 180 * 60
    ) {
      setCustomError(
        "Choose a duration between 1 second and 180 minutes."
      );
      return;
    }

    const duration = minutes * 60 + seconds;

    setCustomDuration(duration);
    setCustomEnabled(true);
    setMode("pomodoro");
    setShowCustom(false);
    setCustomError("");

    resetTimerState(duration);
  }

  function handleStartPause() {
    if (running) {
      const secondsLeft =
        endAt === null
          ? remaining
          : Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

      setRemaining(secondsLeft);
      setRunning(false);
      setEndAt(null);
      return;
    }

    const durationToRun = remaining <= 0 ? totalDuration : remaining;

    setRemaining(durationToRun);
    setEndAt(Date.now() + durationToRun * 1000);
    setHasStarted(true);
    setSessionMessage("");
    setRunning(true);
  }

  function handleReset() {
    resetTimerState(totalDuration);
  }

  function handleSkip() {
    resetTimerState(totalDuration);
    setSessionMessage("Timer skipped. No session was recorded.");
  }

  /* ---------------------------- presentation only --------------------------- */

  const pagePadding = compact ? "px-4 pb-6 pt-4" : "px-4 pb-6 pt-4 sm:px-8 sm:py-7";
  const mainGrid = compact
    ? "grid-cols-1"
    : "grid-cols-1 lg:grid-cols-[1.45fr_0.55fr]";

  const statusLabel = customEnabled
    ? "Custom focus"
    : mode === "pomodoro"
      ? "Focus session"
      : mode === "shortBreak"
        ? "Take a short break"
        : "Take a long break";

  return (
    <div className={`w-full ${pagePadding}`}>
      <PageHeading page="timer" compact={compact} />

      <div className={`mt-5 grid gap-4 sm:mt-6 sm:gap-5 ${mainGrid}`}>
        {/* ------------------------------ Timer card ------------------------------ */}
        <section className="relative overflow-hidden rounded-[26px] bg-[#242521] px-4 py-6 text-white shadow-[0_18px_40px_rgba(36,37,33,0.22)] sm:rounded-[28px] sm:px-8 sm:py-9 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 size-[320px] -translate-x-1/2 rounded-full bg-[#f16f3a]/[0.12] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-[380px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]"
          />

          {/* Timer modes */}
          <div className="relative mx-auto flex w-full max-w-md items-center gap-1 rounded-2xl bg-white/[0.06] p-1">
            {MODES.map((item) => {
              const active = mode === item.id && !customEnabled;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleModeChange(item.id)}
                  aria-pressed={active}
                  className={`h-10 min-w-0 flex-1 whitespace-nowrap rounded-xl px-1.5 text-[11px] font-extrabold transition-colors sm:text-xs ${focusRingDark} ${
                    active
                      ? "bg-white text-[#292a26] shadow-sm"
                      : "text-white/55 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleOpenCustom}
              aria-pressed={customEnabled}
              className={`h-10 min-w-0 flex-1 whitespace-nowrap rounded-xl px-1.5 text-[11px] font-extrabold transition-colors sm:text-xs ${focusRingDark} ${
                customEnabled
                  ? "bg-[#f16f3a] text-white shadow-sm"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom duration controls */}
          {showCustom && (
            <form
              className="relative mx-auto mt-5 max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleApplyCustom();
              }}
            >
              <p className="mb-3 text-center text-sm font-bold text-white/85">
                Set custom focus time
              </p>

              <div className="flex items-end justify-center gap-3">
                <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-white/55">
                  Minutes
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={180}
                    step={1}
                    value={customMinutes}
                    onChange={(event) =>
                      setCustomMinutes(event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-center text-base text-white outline-none transition focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/15"
                  />
                </label>

                <span className="pb-3 text-lg font-bold text-white/40">:</span>

                <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-white/55">
                  Seconds
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={59}
                    step={1}
                    value={customSeconds}
                    onChange={(event) =>
                      setCustomSeconds(event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-center text-base text-white outline-none transition focus:border-[#f16f3a] focus:ring-4 focus:ring-[#f16f3a]/15"
                  />
                </label>
              </div>

              {customError && (
                <p role="alert" className="mt-3 text-center text-xs text-red-300">
                  {customError}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  className={`h-11 rounded-xl bg-[#f16f3a] px-4 text-xs font-bold text-white transition hover:bg-[#e86430] active:scale-[0.98] ${focusRingDark}`}
                >
                  Apply time
                </button>

                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className={`h-11 rounded-xl bg-white/10 px-4 text-xs font-bold text-white/75 transition hover:bg-white/15 ${focusRingDark}`}
                >
                  Close
                </button>
              </div>
            </form>
          )}

          {/* Circular timer */}
          <div
            className={`relative mx-auto mt-8 grid place-items-center rounded-full border-[7px] border-white/10 ${
              compact ? "size-[230px]" : "size-[230px] sm:size-[270px]"
            }`}
          >
            <svg
              className="absolute inset-[-7px] size-[calc(100%+14px)] -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.07"
                strokeWidth="3"
              />

              <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke="#f16f3a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${circumference * progress} ${circumference}`}
                style={{ filter: "drop-shadow(0 0 2.5px rgba(241,111,58,0.65))" }}
                className="transition-[stroke-dasharray] duration-200 motion-reduce:transition-none"
              />
            </svg>

            <div className="relative text-center">
              <p
                className={`font-extrabold tabular-nums tracking-[-3px] ${
                  compact ? "text-[50px]" : "text-[50px] sm:text-[60px]"
                }`}
                role="timer"
                aria-live="off"
              >
                {formatTime(remaining)}
              </p>

              <p className="mx-auto mt-1 max-w-[190px] truncate px-2 text-xs font-bold text-white/55">
                {statusLabel}
              </p>

              <p className="mt-1.5 text-[11px] text-white/35">
                {running
                  ? "Stay in the zone"
                  : hasStarted
                    ? "Timer paused"
                    : "Ready when you are"}
              </p>
            </div>
          </div>

          {/* Timer actions */}
          <div className="relative mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              title="Reset timer"
              aria-label="Reset timer"
              className={`grid size-12 place-items-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white active:scale-95 ${focusRingDark}`}
            >
              <ResetIcon />
            </button>

            <button
              type="button"
              onClick={handleStartPause}
              aria-label={running ? "Pause timer" : "Start timer"}
              className={`grid size-[68px] place-items-center rounded-full bg-[#f16f3a] text-white shadow-[0_10px_28px_rgba(241,111,58,0.45)] transition hover:bg-[#e86430] active:scale-95 motion-reduce:transition-none ${focusRingDark}`}
            >
              {running ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              title="Skip timer"
              aria-label="Skip timer"
              className={`grid size-12 place-items-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white active:scale-95 ${focusRingDark}`}
            >
              <SkipIcon />
            </button>
          </div>

          <p
            className="relative mt-4 min-h-5 text-center text-xs text-white/65"
            aria-live="polite"
          >
            {sessionMessage ||
              (createSession.isPending
                ? "Saving completed session..."
                : "")}
          </p>
        </section>

        {/* -------------------------- Statistics and ambience ------------------------- */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-1 lg:content-start">
          <section className="rounded-[24px] border border-[#e7e5df] bg-white p-5 shadow-[0_8px_30px_rgba(40,40,35,0.04)]">
            <SectionTitle>Today&apos;s focus</SectionTitle>

            <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-1.5px] text-[#2e2f2a]">
              {formattedFocusTime}
            </p>

            <p className="mt-2 text-xs font-semibold text-[#9d9e98]">
              {todayStats.completedSessions}{" "}
              {todayStats.completedSessions === 1
                ? "session"
                : "sessions"}{" "}
              completed
            </p>

            <div
              className="mt-4 flex gap-1.5"
              role="img"
              aria-label={`${todayStats.completedSessions} focus sessions completed today`}
            >
              {Array.from({ length: 6 }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index < todayStats.completedSessions
                      ? "bg-[#f16f3a]"
                      : "bg-[#eceae5]"
                  }`}
                />
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-[#9d9e98]">
              Focus time includes your current focus session. Completed
              sessions are saved for today.
            </p>
          </section>

          <section className="rounded-[24px] border border-[#e7e5df] bg-white p-5 shadow-[0_8px_30px_rgba(40,40,35,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle>Ambient sound</SectionTitle>

              <button
                type="button"
                onClick={() => setSound("none")}
                aria-pressed={sound === "none"}
                className={`h-8 rounded-lg px-3 text-xs font-bold transition ${focusRingLight} ${
                  sound === "none"
                    ? "bg-[#fff0e9] text-[#f16f3a]"
                    : "text-[#9d9e98] hover:bg-[#f5f4f0] hover:text-[#2e2f2a]"
                }`}
              >
                Off
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {SOUNDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSound(item.id)}
                  aria-pressed={sound === item.id}
                  className={`h-12 rounded-xl text-xs font-extrabold transition active:scale-95 ${focusRingLight} ${
                    sound === item.id
                      ? "bg-[#eeeafd] text-[#7561bc] ring-1 ring-[#d9d1f7]"
                      : "bg-[#f5f4f0] text-[#858680] hover:bg-[#eeede7]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p
              className="mt-3 text-xs text-[#9d9e98]"
              aria-live="polite"
            >
              {soundError
                ? "Audio is unavailable in this browser."
                : sound === "none"
                  ? "Choose a sound to play ambient noise."
                  : `${SOUNDS.find((item) => item.id === sound)?.label} ambience is on.`}
            </p>
          </section>

          <p className="px-3 text-center text-xs font-semibold italic text-[#9b9c96] sm:col-span-2 lg:col-span-1">
            “What you focus on grows.”
          </p>
        </div>
      </div>
    </div>
  );
}