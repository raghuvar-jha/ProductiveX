# ProductiveX — Make Every Day Count


## 📸 Preview

![ProductiveX Dashboard](../productivex//screenshots/HomePage.png)

<p align="center">
  <em>Your productivity, organised in one workspace.</em>
</p>


<p align="center">
  <strong>A productivity workspace to plan your day, build better habits, stay focused, and learn smarter.</strong>
</p>



<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## ✨ Overview

**ProductiveX** is a full-stack productivity application designed to bring essential personal productivity tools into one unified workspace.

Instead of switching between multiple applications to manage tasks, track habits, run focus sessions, and revise study materials, ProductiveX helps you organise these activities in one place.

The goal is simple: make productivity easier to maintain through thoughtful design, structured workflows, and tools that encourage consistency.

### Why ProductiveX?

- 🎯 **Stay organised** — turn your daily responsibilities into manageable tasks.
- 🔁 **Build consistency** — track habits and monitor your progress.
- ⏱️ **Protect your focus** — use timed focus sessions to work with intention.
- 🧠 **Learn effectively** — create flashcards and practise spaced review.
- 🔐 **Keep your workspace personal** — authenticate users and associate their productivity data with their accounts.

## 🚀 Features

### ✅ Task Management

Organise your responsibilities and keep track of what needs to get done.

- Create and manage tasks.
- Organise tasks by status.
- Filter tasks by today, tomorrow, upcoming, and completed.
- Track progress through different stages of completion.
- Maintain a clearer overview of daily priorities.

### 🌱 Habit Tracking

Build routines through consistent daily actions.

- Create and manage personal habits.
- Configure habit frequency and weekly targets.
- Track habit completions.
- Monitor progress towards your goals.
- Support daily, weekday, weekly, and custom schedules.

### ⏳ Focus Timer

Make dedicated time for meaningful work.

- Run Pomodoro focus sessions.
- Switch between short and long breaks.
- Play and pause the timer.
- Configure focus session duration.
- Track daily focus activity.

### 🧠 Flashcards & Memory

Make learning and revision part of your daily routine.

- Create flashcard decks.
- Add questions and answers to cards.
- Review cards using spaced-repetition-style ratings.
- Rate recall as Again, Hard, Good, or Easy.
- Review cards when they become due.
- Track review activity and learning statistics.

### 🔐 Authentication

A personal productivity workspace requires reliable account handling.

- User registration and login.
- Session-based authentication using secure cookies.
- Protected application routes.
- User-scoped productivity data.
- API endpoints for managing application resources.

> Authentication and data isolation should be verified across all protected routes before considering the implementation production-ready.

### 🎨 Modern User Interface

ProductiveX is designed with a clean, premium productivity-app aesthetic.

- Warm neutral backgrounds and refined typography.
- A distinctive orange accent colour.
- Rounded cards and subtle borders.
- Responsive layouts for desktop and mobile.
- A consistent interface across productivity tools.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Application framework and routing |
| React | Component-based user interface |
| TypeScript | Static typing and maintainable code |
| Tailwind CSS | Utility-first styling and responsive design |
| TanStack React Query | Server-state fetching and cache management |
| Prisma ORM | Database access and schema management |
| PostgreSQL | Relational data storage |
| JWT / Session Cookies | Authentication and session handling |

*The stack reflects the project's current architecture; update this list if your implementation changes.*

## 🏗️ Architecture

ProductiveX follows a feature-oriented approach to frontend organisation, with API routes handling server-side operations and Prisma managing database access.

```text
┌──────────────────────────────────┐
│           User Interface         │
│       Next.js + React + TS        │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│        Feature Modules           │
│   Tasks · Habits · Focus         │
│            Memories              │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│       Next.js API Routes         │
│  Authentication & CRUD requests  │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│           Prisma ORM             │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│           PostgreSQL             │
└──────────────────────────────────┘
```

### Engineering principles

- **Separation of concerns:** UI components, feature logic, API handlers, and database operations have distinct responsibilities.
- **Type safety:** TypeScript types help maintain consistency across the application.
- **Server-state management:** React Query supports fetching, caching, and refreshing data.
- **Relational data modelling:** Prisma defines relationships between users and their productivity resources.
- **User-scoped access:** Server-side ownership checks should ensure users can access only their own records.

## 📁 Project Structure

The project uses a feature-oriented frontend structure alongside Next.js App Router conventions.

```text
productivex/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── habits/
│   │   ├── focus/
│   │   └── memories/
│   ├── (protected)/
│   ├── login/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx
├── component/
├── features/
│   ├── tasks/
│   │   ├── api.ts
│   │   ├── queries.ts
│   │   └── types.ts
│   ├── habits/
│   ├── focus/
│   └── memories/
├── lib/
│   ├── auth.ts
│   └── db.ts
├── prisma/
│   └── schema.prisma
├── public/
├── generated/
├── types/
├── utils/
├── package.json
└── README.md
```

*This is a representative structure. Adjust the folders and API route names to match your actual repository.*

## ⚙️ Getting Started

Follow these steps to run ProductiveX locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — a version compatible with your Next.js setup.
- npm, which comes with Node.js.
- A running PostgreSQL database, either locally or through a hosted provider.
- Git.

### 1. Clone the repository

```bash
git clone <https://github.com/raghuvar-jha/ProductiveX>
cd productivex
```

Replace `<https://github.com/raghuvar-jha/ProductiveX>` with your actual Git repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_long_random_secret"
```

Use the exact environment variable names expected by your authentication and database code. If your project uses a separate Prisma direct connection URL, configure that as well.

**Important:** Never commit your `.env` file, database credentials, or authentication secrets to version control.

### 4. Generate the Prisma client

```bash
npx prisma generate
```

### 5. Apply database migrations

For local development:

```bash
npx prisma migrate dev
```

If your project already has migrations, this applies them to your configured database. If migrations have not been created yet, review your schema and create the initial migration.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You're ready to explore ProductiveX!

## 🔒 Security Considerations

Security is an important part of any application that stores personal user data.

ProductiveX's authentication and data-access implementation should follow these principles:

- Store password hashes rather than plain-text passwords.
- Keep session secrets and database credentials in environment variables.
- Use HTTP-only cookies for authentication tokens where appropriate.
- Validate and authenticate requests on the server.
- Check resource ownership before reading, updating, or deleting records.
- Never trust a client-provided user ID as proof of ownership.
- Use HTTPS in production and configure cookie security appropriately.
- Return safe, meaningful error responses without exposing sensitive internals.

## 🗺️ Roadmap

The following are potential improvements for future releases.

- [ ] Add richer analytics for habits, tasks, and focus sessions.
- [ ] Improve dashboard insights and productivity summaries.
- [ ] Add reminders and notifications.
- [ ] Enhance accessibility and keyboard navigation.
- [ ] Expand automated tests for API routes and authentication.
- [ ] Optimise database queries and application performance.
- [ ] Add continuous integration and deployment workflows.
- [ ] Improve deployment documentation and production monitoring.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes and test them.
4. Commit your changes.

   ```bash
   git commit -m "feat: describe your change"
   ```

5. Push the branch and open a pull request.

Please describe the motivation behind significant changes and include screenshots for UI improvements when possible.

## 📄 License

This project does not specify a license yet.

If you intend to open-source ProductiveX, consider adding an appropriate `LICENSE` file and updating this section. Until then, don't assume that others have permission to redistribute or modify the code.

## 👨‍💻 Author

**Raghuvar Jha**

Full-Stack Developer | Building useful products with modern web technologies.

- GitHub: [Your GitHub Profile](https://github.com/raghuvar-jha)
- LinkedIn: [Your LinkedIn Profile](https://in.linkedin.com/in/raghuvar-jha)

---

<p align="center">
  <strong>Build better habits. Focus on what matters. Make every day count.</strong>
  <br />
  Made with ❤️ and a commitment to continuous improvement.
</p>
