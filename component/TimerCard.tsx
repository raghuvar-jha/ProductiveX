"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const FOCUS_DURATION = 25 * 60;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f67741] focus-visible:ring-offset-2 focus-visible:ring-offset-[#232420]";

export default function TimerCard() {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const savedRef = useRef(false);

  const saveCompletedSession = useCallback(async () => {
    if (savedRef.current) return;

    savedRef.current = true;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/focus", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "pomodoro",
          durationSeconds: FOCUS_DURATION,
        }),
      });

      if (!response.ok) {
        throw new Error("Session finished, but saving failed.");
      }

      setMessage("Focus session saved!");
    } catch (error) {
      // Permit retrying the save without repeating the countdown.
      savedRef.current = false;
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your focus session."
      );
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return;

    setIsRunning(false);
    void saveCompletedSession();
  }, [secondsLeft, isRunning, saveCompletedSession]);

  function toggleTimer() {
    setMessage("");

    if (secondsLeft === 0) {
      // A finished timer starts a new focus session.
      savedRef.current = false;
      setSecondsLeft(FOCUS_DURATION);
      setIsRunning(true);
      return;
    }

    setIsRunning((running) => !running);
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(FOCUS_DURATION);
    savedRef.current = false;
    setMessage("");
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress =
    ((FOCUS_DURATION - secondsLeft) / FOCUS_DURATION) * 100;

  /* ---------------------------- presentation only --------------------------- */

  const circumference = 2 * Math.PI * 47;
  const statusText = isRunning
    ? "Stay focused"
    : secondsLeft === 0
      ? "Session complete"
      : "Ready when you are";

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-[#232420] p-5 text-white shadow-[0_18px_40px_rgba(36,37,33,0.22)] sm:rounded-[26px] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full border-[30px] border-white/[0.035]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[#f67741]/[0.12] blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold tracking-[-0.2px] text-white">
            Focus session
          </p>

          <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-white/60">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${
                isRunning
                  ? "animate-pulse bg-[#f67741] motion-reduce:animate-none"
                  : secondsLeft === 0
                    ? "bg-[#4ba67b]"
                    : "bg-white/30"
              }`}
            />
            {statusText}
          </p>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">
          25 min
        </span>
      </div>

      {/* Ring + time */}
      <div
        className="relative mx-auto mt-6 grid size-[190px] place-items-center sm:size-[210px]"
        role="progressbar"
        aria-label="Focus session progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.09"
            strokeWidth="3.5"
          />
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="#f67741"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${(circumference * progress) / 100} ${circumference}`}
            style={{ filter: "drop-shadow(0 0 2.5px rgba(246,119,65,0.6))" }}
            className="transition-[stroke-dasharray] duration-300 motion-reduce:transition-none"
          />
        </svg>

        <p
          className="relative text-[46px] font-extrabold tabular-nums tracking-[-2.5px] sm:text-[52px]"
          aria-live="off"
        >
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </p>
      </div>

      {/* Controls */}
      <div className="relative mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={resetTimer}
          aria-label="Reset focus timer"
          title="Reset timer"
          className={`grid size-12 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white active:scale-95 ${focusRing}`}
        >
          <Icon name="rotate" size={16} />
        </button>

        <button
          type="button"
          onClick={toggleTimer}
          disabled={saving}
          aria-label={
            isRunning
              ? "Pause focus timer"
              : secondsLeft === 0
                ? "Start another focus session"
                : "Start focus timer"
          }
          className={`grid size-16 place-items-center rounded-full bg-[#f67741] text-white shadow-[0_10px_28px_rgba(246,119,65,0.45)] transition hover:bg-[#ec6a34] active:scale-95 disabled:opacity-60 disabled:shadow-none motion-reduce:transition-none ${focusRing}`}
        >
          <Icon
            name={isRunning ? "pause" : "playT"}
            size={20}
          />
        </button>
      </div>

      {(message || saving) && (
        <p
          role="status"
          className="relative mt-4 text-center text-xs font-medium text-white/70"
        >
          {saving ? "Saving your session..." : message}
          {!saving &&
            secondsLeft === 0 &&
            message.includes("saving failed") && (
              <button
                type="button"
                onClick={() => void saveCompletedSession()}
                className={`ml-2 rounded font-bold text-[#f67741] underline underline-offset-2 ${focusRing}`}
              >
                Retry
              </button>
            )}
        </p>
      )}
    </div>
  );
}