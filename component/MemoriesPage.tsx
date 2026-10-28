// components/MemoriesPage.tsx

"use client";
import { useState } from "react";

import Icon from "./Icon";
import PageHeading from "./PageHeading";
import SectionTitle from "./SectionTitle";

import {
  useAddMemoryCard,
  useCreateMemoryDeck,
  useDailyReviewCards,
  useMemoryDecks,
  useMemoryStats,
  useReviewMemoryCard,
} from "@/features/memories/queries";

import type {
  Flashcard,
  MemoryRating,
} from "@/features/memories/types";

type View = "library" | "deck" | "review" | "complete";

type ReviewItem = {
  card: Flashcard;
  deckId: number | null;
  deckTitle: string;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16f3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]";

const COLORS = [
  "bg-[#8270c7]",
  "bg-[#f07a46]",
  "bg-[#4b9a75]",
  "bg-[#d49a3d]",
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#e5e2da] bg-[#fbfaf7] px-4 py-3 text-sm font-medium text-[#343530] outline-none transition placeholder:text-[#aaa9a2] focus:border-[#f16f3a] focus:bg-white focus:ring-4 focus:ring-[#f16f3a]/10";

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 w-full bg-[#fbfaf7] text-[#292a25]">
      {children}
    </div>
  );
}

export default function MemoriesPage({
  compact = false,
}: {
  compact?: boolean;
}) {
  // Fetch data using React Query.
  const decksQuery = useMemoryDecks();
  const dailyQuery = useDailyReviewCards();
  const statsQuery = useMemoryStats();

  // Mutations.
  const createDeckMutation = useCreateMemoryDeck();
  const addCardMutation = useAddMemoryCard();
  const reviewMutation = useReviewMemoryCard();

  const decks = decksQuery.data ?? [];
  const dailyCards = dailyQuery.data ?? [];
  const stats = statsQuery.data;

  // Page navigation state.
  const [view, setView] = useState<View>("library");
  const [selectedDeckId, setSelectedDeckId] =
    useState<number | null>(null);

  // Create deck modal state.
  const [showCreateDeck, setShowCreateDeck] =
    useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] =
    useState("");
  const [selectedColor, setSelectedColor] =
    useState(COLORS[0]);

  // Add flashcard modal state.
  const [showAddCard, setShowAddCard] =
    useState(false);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");

  // Review state.
  const [reviewCards, setReviewCards] =
    useState<ReviewItem[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [answerVisible, setAnswerVisible] =
    useState(false);
  const [reviewScore, setReviewScore] = useState({
    again: 0,
    learned: 0,
  });

  const [formError, setFormError] = useState("");

  const selectedDeck =
    decks.find((deck) => deck.id === selectedDeckId) ??
    null;

  const currentReview = reviewCards[reviewIndex];

  // Loading state.
  if (decksQuery.isLoading || dailyQuery.isLoading) {
    return (
      <PageShell>
        <div className="px-4 py-12 text-sm font-semibold text-[#777872] sm:px-8">
          Loading your memories...
        </div>
      </PageShell>
    );
  }

  // Error state.
  if (decksQuery.isError) {
    return (
      <PageShell>
        <div className="p-8">
          <p className="font-bold text-[#363732]">
            Could not load your memories.
          </p>

          <button
            onClick={() => decksQuery.refetch()}
            className="mt-3 rounded-xl bg-[#242521] px-4 py-3 text-xs font-bold text-white"
          >
            Try again
          </button>
        </div>
      </PageShell>
    );
  }

  // Create a new deck.
  async function createDeck() {
    setFormError("");

    try {
      const deck = await createDeckMutation.mutateAsync({
        title: deckName,
        description: deckDescription,
        color: selectedColor,
        icon: "cards",
      });

      setSelectedDeckId(deck.id);
      setDeckName("");
      setDeckDescription("");
      setSelectedColor(COLORS[0]);
      setShowCreateDeck(false);
      setView("deck");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not create deck."
      );
    }
  }

  // Add a flashcard to the selected deck.
  async function addCard() {
    if (!selectedDeck) return;

    setFormError("");

    try {
      await addCardMutation.mutateAsync({
        deckId: selectedDeck.id,
        front: cardFront,
        back: cardBack,
      });

      setCardFront("");
      setCardBack("");
      setShowAddCard(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not add card."
      );
    }
  }

  // Start a review session.
  function beginReview(
    items: ReviewItem[],
    deckId: number | null = null
  ) {
    const filtered =
      deckId === null
        ? items
        : items.filter((item) => item.deckId === deckId);

    if (!filtered.length) return;

    setSelectedDeckId(deckId);
    setReviewCards(filtered);
    setReviewIndex(0);
    setAnswerVisible(false);
    setReviewScore({ again: 0, learned: 0 });
    setFormError("");
    setView("review");
  }

  // Start studying the selected deck.
  function studyDeck() {
    if (!selectedDeck) return;

    const items: ReviewItem[] = selectedDeck.cards.map(
      (card) => ({
        card,
        deckId: selectedDeck.id,
        deckTitle: selectedDeck.title,
      })
    );

    beginReview(items, selectedDeck.id);
  }

  // Save a rating and move to the next flashcard.
  async function rateCard(rating: MemoryRating) {
    if (!currentReview) return;

    setFormError("");

    try {
      await reviewMutation.mutateAsync({
        deckId: currentReview.deckId,
        cardId: currentReview.card.id,
        rating,
      });

      setReviewScore((score) => ({
        again:
          score.again + (rating === "again" ? 1 : 0),
        learned:
          score.learned + (rating === "again" ? 0 : 1),
      }));

      if (reviewIndex === reviewCards.length - 1) {
        setView("complete");
      } else {
        setReviewIndex((index) => index + 1);
        setAnswerVisible(false);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save your review."
      );
    }
  }

  const contentPadding = compact
    ? "px-4 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5"
    : "px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7";

  // --------------------------------------------------
  // REVIEW SCREEN
  // --------------------------------------------------

  if (view === "review" && currentReview) {
    const progress =
      ((reviewIndex + 1) / reviewCards.length) * 100;

    return (
      <PageShell>
        <div className={`${contentPadding} min-h-full`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setView(selectedDeckId ? "deck" : "library")
              }
              className="flex items-center gap-2 text-[11px] font-extrabold text-[#767771]"
            >
              <span className="rotate-180">
                <Icon name="arrow" size={14} />
              </span>
              Exit review
            </button>

            <p className="text-[11px] font-extrabold text-[#898a84]">
              {reviewIndex + 1} of {reviewCards.length}
            </p>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e8e6e0]">
            <div
              className="h-full rounded-full bg-[#f16f3a] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className={`mx-auto ${
              compact ? "mt-6 sm:mt-8" : "mt-7 sm:mt-10 max-w-[680px]"
            }`}
          >
            <div
              className={`flex flex-col rounded-[28px] border border-[#e2dfd7] bg-white p-7 shadow-[0_22px_60px_rgba(43,42,37,0.09)] ${
                compact ? "min-h-[340px] sm:min-h-[370px]" : "min-h-[360px] sm:min-h-[390px]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f0edff] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[1px] text-[#7561bc]">
                  {currentReview.deckTitle}
                </span>

                <span className="text-xs font-bold text-[#aaa9a3]">
                  Flashcard
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                <p className="text-xs font-extrabold uppercase tracking-[1.7px] text-[#b0b1aa]">
                  {answerVisible ? "Answer" : "Question"}
                </p>

                <p
                  className={`mt-5 max-w-[510px] whitespace-pre-wrap font-extrabold leading-[1.45] tracking-[-0.5px] text-[#2f302b] ${
                    compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                  }`}
                >
                  {answerVisible
                    ? currentReview.card.back
                    : currentReview.card.front}
                </p>

                {answerVisible && (
                  <p className="mt-5 text-[11px] font-semibold text-[#a1a29b]">
                    How well did you remember this?
                  </p>
                )}
              </div>

              {!answerVisible ? (
                <button
                  onClick={() => setAnswerVisible(true)}
                  className="w-full rounded-xl bg-[#242521] py-3.5 text-xs font-extrabold text-white"
                >
                  Reveal answer
                </button>
              ) : (
                <div
                  className={`grid gap-2 ${
                    compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
                  }`}
                >
                  {(
                    [
                      [
                        "Again",
                        "Review soon",
                        "again",
                        "bg-[#fff0e9] text-[#d65e2e]",
                      ],
                      [
                        "Hard",
                        "1 day",
                        "hard",
                        "bg-[#fff6e5] text-[#ad7924]",
                      ],
                      [
                        "Good",
                        "3+ days",
                        "good",
                        "bg-[#eaf6ef] text-[#3d8b67]",
                      ],
                      [
                        "Easy",
                        "7+ days",
                        "easy",
                        "bg-[#f0edff] text-[#7561bc]",
                      ],
                    ] as const
                  ).map(([label, time, rating, colors]) => (
                    <button
                      key={label}
                      disabled={reviewMutation.isPending}
                      onClick={() => rateCard(rating)}
                      className={`rounded-xl px-2 py-3 disabled:opacity-50 ${colors}`}
                    >
                      <span className="block text-[11px] font-extrabold">
                        {label}
                      </span>

                      <span className="mt-0.5 block text-[11px] font-semibold opacity-70">
                        {time}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs font-semibold text-[#a8a9a3]">
              {answerVisible
                ? "Choose a rating to save and continue"
                : "Think of the answer before revealing it"}
            </p>

            {formError && (
              <p className="mt-3 text-center text-xs font-semibold text-red-600">
                {formError}
              </p>
            )}
          </div>
        </div>
      </PageShell>
    );
  }

  // --------------------------------------------------
  // REVIEW COMPLETION SCREEN
  // --------------------------------------------------

  if (view === "complete") {
    return (
      <PageShell>
        <div
          className={`flex min-h-[650px] items-center justify-center ${
            compact ? "px-5 py-8" : "px-8 py-12"
          }`}
        >
          <div className="w-full max-w-[520px] rounded-[28px] border border-[#e5e2dc] bg-white p-8 text-center shadow-[0_22px_60px_rgba(43,42,37,0.08)]">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e9f5ef] text-[#3d8b67]">
              <Icon name="check" size={28} />
            </div>

            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#a0a19b]">
              Review complete
            </p>

            <h1 className="mt-2 text-[26px] font-extrabold tracking-[-1px] text-[#2d2e29]">
              Nice work!
            </h1>

            <p className="mx-auto mt-2 max-w-[330px] text-xs leading-5 text-[#92938d]">
              You reviewed {reviewCards.length}{" "}
              {reviewCards.length === 1
                ? "memory"
                : "memories"}{" "}
              in this session.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-2">
              {[
                ["Reviewed", reviewCards.length],
                ["Remembered", reviewScore.learned],
                ["Review again", reviewScore.again],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#f6f5f1] p-4"
                >
                  <p className="text-[20px] font-extrabold text-[#33342f]">
                    {value}
                  </p>

                  <p className="mt-1 text-[11px] font-bold text-[#9c9d97]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div
              className={`mt-7 flex gap-2 ${
                compact ? "flex-col sm:flex-row" : ""
              }`}
            >
              <button
                onClick={() => setView("library")}
                className="flex-1 rounded-xl border border-[#dedcd5] py-3 text-[11px] font-extrabold text-[#73746e]"
              >
                Back to library
              </button>

              <button
                onClick={() => beginReview(reviewCards)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#242521] py-3 text-[11px] font-extrabold text-white"
              >
                <Icon name="play" size={12} />
                Review again
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // --------------------------------------------------
  // SELECTED DECK SCREEN
  // --------------------------------------------------

  if (view === "deck" && selectedDeck) {
    return (
      <PageShell>
        <div className={contentPadding}>
          <button
            onClick={() => setView("library")}
            className="flex items-center gap-2 text-[11px] font-extrabold text-[#767771]"
          >
            <span className="rotate-180">
              <Icon name="arrow" size={14} />
            </span>
            All decks
          </button>

          <div
            className={`mt-5 flex justify-between gap-4 ${
              compact ? "items-start" : "items-end"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white ${selectedDeck.color}`}
              >
                {/* <Icon name={selectedDeck.icon} size={20} /> */}
                AB
              </div>

              <div>
                <h1
                  className={`font-extrabold tracking-[-0.8px] text-[#292a25] ${
                    compact ? "text-[22px]" : "text-[27px]"
                  }`}
                >
                  {selectedDeck.title}
                </h1>

                <p className="mt-1 text-[11px] font-medium text-[#999a94]">
                  {selectedDeck.description}
                </p>
              </div>
            </div>

            {!compact && (
              <button
                onClick={studyDeck}
                disabled={!selectedDeck.cards.length}
                className="flex items-center gap-2 rounded-xl bg-[#242521] px-4 py-3 text-[11px] font-extrabold text-white disabled:opacity-35"
              >
                <Icon name="play" size={12} />
                Study deck
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Cards", selectedDeck.total],
              ["Due today", selectedDeck.due],
              [
                "Mastery",
                selectedDeck.total
                  ? `${Math.round(
                      ((selectedDeck.total - selectedDeck.due) /
                        selectedDeck.total) *
                        100
                    )}%`
                  : "—",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#e7e5df] bg-white p-4"
              >
                <p className="text-[18px] font-extrabold text-[#343530]">
                  {value}
                </p>

                <p className="mt-1 text-xs font-bold text-[#999a94]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-extrabold text-[#30312c]">
                Cards
              </h2>

              <p className="mt-1 text-xs font-semibold text-[#a0a19b]">
                Questions and answers in this deck
              </p>
            </div>

            <button
              onClick={() => {
                setFormError("");
                setShowAddCard(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#f16f3a] px-3 py-2.5 text-[11px] font-extrabold text-white"
            >
              <Icon name="plus" size={13} />
              Add card
            </button>
          </div>

          {selectedDeck.cards.length ? (
            <div className="mt-3 space-y-2.5">
              {selectedDeck.cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`grid gap-3 rounded-2xl border border-[#e7e5df] bg-white p-4 ${
                    compact
                      ? "grid-cols-[24px_1fr]"
                      : "grid-cols-[28px_minmax(0,1fr)] sm:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)]"
                  }`}
                >
                  <span className="grid size-6 place-items-center rounded-lg bg-[#f3f1ed] text-xs font-extrabold text-[#93948e]">
                    {index + 1}
                  </span>

                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b0b1ab]">
                      Front
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-[11px] font-bold leading-4 text-[#3c3d38]">
                      {card.front}
                    </p>
                  </div>

                  <div className={compact ? "col-start-2" : ""}>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b0b1ab]">
                      Back
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-[11px] font-medium leading-4 text-[#777872]">
                      {card.back}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-[22px] border border-dashed border-[#d9d7d0] bg-white px-5 py-10 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-xl bg-[#f0edff] text-[#7561bc]">
                <Icon name="cards" size={19} />
              </div>

              <p className="mt-3 text-[11px] font-extrabold text-[#3c3d38]">
                This deck is ready for its first card
              </p>

              <p className="mt-1 text-xs text-[#9b9c96]">
                Add a question and answer to begin learning.
              </p>
            </div>
          )}

          {compact && (
            <button
              onClick={studyDeck}
              disabled={!selectedDeck.cards.length}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#242521] py-3.5 text-[11px] font-extrabold text-white disabled:opacity-35"
            >
              <Icon name="play" size={12} />
              Study deck
            </button>
          )}

          {formError && (
            <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
              {formError}
            </p>
          )}
        </div>

        {/* Add flashcard modal */}
        {showAddCard && (
          <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#242521]/45 p-3 backdrop-blur-sm sm:p-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void addCard();
              }}
              className="my-auto w-full max-w-[480px] rounded-[24px] border border-[#e7e5df] bg-[#fbfaf7] p-5 shadow-[0_24px_80px_rgba(36,37,33,0.18)] sm:rounded-[28px] sm:p-7"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[17px] font-extrabold text-[#2e2f2a]">
                    Add a memory
                  </h2>

                  <p className="mt-1 text-xs text-[#9b9c96]">
                    Keep each card focused on one idea.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="grid size-8 place-items-center rounded-lg bg-[#f4f3ef] text-[12px] font-bold"
                >
                  ×
                </button>
              </div>

              <label className="mt-5 block text-xs font-extrabold uppercase tracking-wider text-[#777872]">
                Question or prompt

                <textarea
                  required
                  value={cardFront}
                  onChange={(event) =>
                    setCardFront(event.target.value)
                  }
                  rows={3}
                  placeholder="e.g. What is the peak-end rule?"
                  className={`${fieldClass} resize-none`}
                />
              </label>

              <label className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-[#777872]">
                Answer

                <textarea
                  required
                  value={cardBack}
                  onChange={(event) =>
                    setCardBack(event.target.value)
                  }
                  rows={4}
                  placeholder="Write a concise answer..."
                  className={`${fieldClass} resize-none`}
                />
              </label>

              {formError && (
                <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
                  {formError}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="rounded-xl px-4 py-3 text-[11px] font-extrabold text-[#7d7e78]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !cardFront.trim() ||
                    !cardBack.trim() ||
                    addCardMutation.isPending
                  }
                  className="rounded-xl bg-[#f16f3a] px-5 py-3 text-[11px] font-extrabold text-white disabled:opacity-40"
                >
                  {addCardMutation.isPending
                    ? "Saving..."
                    : "Add card"}
                </button>
              </div>
            </form>
          </div>
        )}
      </PageShell>
    );
  }

  // --------------------------------------------------
  // MAIN MEMORIES LIBRARY
  // --------------------------------------------------

  return (
    <PageShell>
      <div className={contentPadding}>
        <PageHeading
          page="memories"
          compact={compact}
          onAction={() => {
            setFormError("");
            setShowCreateDeck(true);
          }}
        />

        {/* Daily review and statistics */}
        <div
          className={`mt-6 grid gap-5 ${
            compact
              ? "grid-cols-1"
              : "grid-cols-1 xl:grid-cols-[1.35fr_0.65fr]"
          }`}
        >
          <section className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#242521] p-6 text-white">
            <div className="absolute -right-16 -top-20 size-64 rounded-full border-[45px] border-white/[0.035]" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[1.2px] text-white/65">
                  Daily review
                </span>

                <span className="flex items-center gap-1 text-[11px] font-bold text-[#ff9364]">
                  <Icon name="flame" size={13} />
                  {stats?.streak ?? 0} day streak
                </span>
              </div>

              <p
                className={`mt-7 font-extrabold tracking-[-0.7px] ${
                  compact ? "text-[22px]" : "text-[26px]"
                }`}
              >
                {dailyCards.length}{" "}
                {dailyCards.length === 1 ? "card is" : "cards are"}{" "}
                ready
                <br />
                for review.
              </p>

              <p className="mt-2 max-w-[340px] text-xs leading-5 text-white/50">
                A short review now will strengthen what you
                learned and keep your knowledge fresh.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => beginReview(dailyCards)}
                  disabled={!dailyCards.length}
                  className="flex items-center gap-2 rounded-xl bg-[#f16f3a] px-4 py-3 text-[11px] font-extrabold disabled:opacity-50"
                >
                  <Icon name="play" size={13} />
                  Start review
                </button>

                <div>
                  <p className="text-[14px] font-extrabold">
                    {stats?.totalCards ?? 0}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                    Total cards
                  </p>
                </div>

                <div>
                  <p className="text-[14px] font-extrabold">
                    {stats?.reviewedToday ?? 0}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                    Reviewed today
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Review summary */}
          <section className="rounded-[24px] border border-[#e7e5df] bg-white p-5 sm:p-6">
            <SectionTitle>Review summary</SectionTitle>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#777872]">
                  Cards due
                </span>
                <span className="text-[12px] font-extrabold text-[#f16f3a]">
                  {stats?.dueCards ?? 0}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#eeece6]">
                <div
                  className="h-full rounded-full bg-[#f16f3a]"
                  style={{
                    width: `${
                      stats?.totalCards
                        ? Math.min(
                            100,
                            ((stats.dueCards ?? 0) /
                              stats.totalCards) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#777872]">
                  Remembered today
                </span>
                <span className="text-[12px] font-extrabold text-[#3d8b67]">
                  {stats?.rememberedToday ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#777872]">
                  Review again
                </span>
                <span className="text-[12px] font-extrabold text-[#d65e2e]">
                  {stats?.againToday ?? 0}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Deck library heading */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#2d2e2a]">
              Your decks
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#a0a19b]">
              {decks.length} collections ·{" "}
              {decks.reduce(
                (sum, deck) => sum + deck.total,
                0
              )}{" "}
              cards
            </p>
          </div>

          <button
            onClick={() => {
              setFormError("");
              setShowCreateDeck(true);
            }}
            className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f16f3a] px-3.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(241,111,58,0.32)] transition hover:bg-[#e9622d] active:scale-[0.97] sm:px-4 ${focusRing}`}
          >
            + Create deck
          </button>
        </div>

        {/* Deck cards */}
        {decks.length ? (
          <div
            className={`mt-3 grid gap-3 ${
              compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  setSelectedDeckId(deck.id);
                  setView("deck");
                }}
                className="rounded-[22px] border border-[#e7e5df] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#ded9cf] hover:shadow-[0_18px_40px_rgba(36,37,33,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`grid size-10 place-items-center rounded-xl text-white ${deck.color}`}
                  >
                    AB
                  </div>

                  <Icon name="arrow" size={15} />
                </div>

                <p className="mt-5 text-[12px] font-extrabold text-[#353631]">
                  {deck.title}
                </p>

                <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#a1a29c]">
                  {deck.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#efede8] pt-3">
                  <span className="text-xs font-bold text-[#8d8e88]">
                    {deck.total} cards
                  </span>

                  <span className="text-[11px] font-extrabold text-[#f16f3a]">
                    {deck.due
                      ? `${deck.due} due`
                      : "Up to date"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-[22px] border border-dashed border-[#d9d7d0] bg-white px-5 py-10 text-center">
            <div className="mx-auto grid size-11 place-items-center rounded-xl bg-[#f0edff] text-[#7561bc]">
              <Icon name="cards" size={19} />
            </div>

            <p className="mt-3 text-[11px] font-extrabold text-[#3c3d38]">
              Create your first deck
            </p>

            <p className="mt-1 text-xs text-[#9b9c96]">
              Organize what you learn into reusable flashcards.
            </p>
          </div>
        )}

        {formError && (
          <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
            {formError}
          </p>
        )}
      </div>

      {/* Create deck modal */}
      {showCreateDeck && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#242521]/45 p-3 backdrop-blur-sm sm:p-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void createDeck();
            }}
            className="my-auto w-full max-w-[460px] rounded-[24px] border border-[#e7e5df] bg-[#fbfaf7] p-5 shadow-[0_24px_80px_rgba(36,37,33,0.18)] sm:rounded-[28px] sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[1.4px] text-[#8270c7]">
                  New collection
                </p>

                <h2 className="mt-1 text-[19px] font-extrabold text-[#2e2f2a]">
                  Create a deck
                </h2>

                <p className="mt-1 text-xs text-[#9b9c96]">
                  Organize related ideas into one focused space.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateDeck(false)}
                className="grid size-8 place-items-center rounded-lg bg-[#f4f3ef] text-[12px] font-bold"
              >
                ×
              </button>
            </div>

            <label className="mt-5 block text-xs font-extrabold uppercase tracking-wider text-[#777872]">
              Deck name

              <input
                autoFocus
                required
                value={deckName}
                onChange={(event) =>
                  setDeckName(event.target.value)
                }
                placeholder="e.g. Psychology basics"
                className={fieldClass}
              />
            </label>

            <label className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-[#777872]">
              Description

              <textarea
                value={deckDescription}
                onChange={(event) =>
                  setDeckDescription(event.target.value)
                }
                rows={3}
                placeholder="What would you like to remember?"
                className={`${fieldClass} resize-none`}
              />
            </label>

            <div className="mt-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#777872]">
                Deck color
              </p>

              <div className="mt-3 flex gap-3">
                {COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    aria-label={`Choose ${color}`}
                    onClick={() => setSelectedColor(color)}
                    className={`size-7 rounded-full ${color} ${
                      selectedColor === color
                        ? "ring-2 ring-[#282924] ring-offset-2"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {formError && (
              <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateDeck(false)}
                className="rounded-xl px-4 py-3 text-[11px] font-extrabold text-[#7d7e78]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  !deckName.trim() ||
                  createDeckMutation.isPending
                }
                className="rounded-xl bg-[#242521] px-5 py-3 text-[11px] font-extrabold text-white disabled:opacity-40"
              >
                {createDeckMutation.isPending
                  ? "Creating..."
                  : "Create deck"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  );
}