import type { Flashcard, MemoryDeck } from "../types/Memory";

export const starterDecks: MemoryDeck[] = [
  {
    id: 1,
    title: "Design principles",
    description: "UX laws, visual systems, and product thinking",
    total: 24,
    due: 8,
    color: "bg-[#8270c7]",
    icon: "cards",
    cards: [
      { id: 1, front: "What is the peak-end rule?", back: "People judge an experience mainly by its most intense point and how it ends." },
      { id: 2, front: "What does Hick’s Law describe?", back: "The time needed to make a decision increases with the number and complexity of choices." },
      { id: 3, front: "What is progressive disclosure?", back: "Showing only essential information first, then revealing advanced options when needed." },
    ],
  },
  {
    id: 2,
    title: "Spanish essentials",
    description: "Everyday vocabulary and useful phrases",
    total: 48,
    due: 12,
    color: "bg-[#f07a46]",
    icon: "book",
    cards: [
      { id: 4, front: "How do you say “I would like”?", back: "Me gustaría." },
      { id: 5, front: "What does “¿Cuánto cuesta?” mean?", back: "How much does it cost?" },
      { id: 6, front: "Translate: See you tomorrow", back: "Hasta mañana." },
    ],
  },
  {
    id: 3,
    title: "Product strategy",
    description: "Frameworks for building valuable products",
    total: 18,
    due: 4,
    color: "bg-[#4b9a75]",
    icon: "briefcase",
    cards: [
      { id: 7, front: "What is a North Star metric?", back: "A single metric that captures the core value a product delivers to customers." },
      { id: 8, front: "What makes a good product hypothesis?", back: "A testable statement connecting a user problem, proposed solution, and expected outcome." },
      { id: 9, front: "Define opportunity cost", back: "The value of the best alternative given up when making a decision." },
    ],
  },
]

export const dailyReviewCards: Flashcard[] = starterDecks.flatMap((deck) => deck.cards).slice(0, 8)
