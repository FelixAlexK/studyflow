# StudyFlow

A productivity and study management app built with React, TanStack Router, Convex, and WorkOS authentication.

## Features

- **📋 Task Management** - Create, edit, and track tasks with due dates
- **📅 Calendar** - Visual calendar with event scheduling
- **⏱️ Pomodoro Timer** - Focus timer with customizable work/break intervals
- **📊 Productivity Dashboard** - Track completed tasks, focus sessions, and total focus time
- **🔔 Smart Reminders** - Configurable task reminders with in-app notifications
- **🎨 Modern UI** - Built with shadcn/ui and Tailwind CSS
- **🔐 Secure Authentication** - WorkOS SSO integration
- **⚡ Real-time Updates** - Powered by Convex backend

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm)
- Convex account ([convex.dev](https://convex.dev))
- WorkOS account ([workos.com](https://workos.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Convex and WorkOS credentials
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

   This will:
   - Start Convex backend (runs `npx convex dev`)
   - Start Vite dev server on `http://localhost:3000`

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx      # Root layout with sidebar
│   ├── index.tsx       # Dashboard page
│   ├── _authed/        # Protected routes
│   │   ├── tasks.tsx   # Task management
│   │   ├── calendar.tsx # Calendar view
│   │   └── pomodoro.tsx # Focus timer
│   └── auth.tsx        # Authentication pages
├── components/         # React components
│   ├── TaskList.tsx    # Task CRUD interface
│   ├── CalendarComponent.tsx # FullCalendar integration
│   ├── PomodoroTimer.tsx # Focus timer with persistence
│   ├── ProductivityOverview.tsx # Stats dashboard
│   ├── ReminderChecker.tsx # Background reminder checker
│   ├── ErrorBoundary.tsx # Error handling
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities
└── styles.css          # Global styles

convex/
├── schema.ts           # Database schema (tasks, events, focusSessions)
├── tasks.ts            # Task queries and mutations
├── events.ts           # Calendar event functions
├── stats.ts            # Productivity statistics
└── reminders.ts        # Reminder management
```

## Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router, TanStack Query
- **Backend**: Convex (serverless backend-as-a-service)
- **Auth**: WorkOS AuthKit
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Calendar**: FullCalendar
- **Build**: Vite, TypeScript
- **Deployment**: Vercel/Railway/Render/Docker

## Development

### Available Scripts

```bash
pnpm dev          # Start dev server with Convex
pnpm dev:web      # Start only Vite dev server
pnpm dev:convex   # Start only Convex dev
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code with Biome
pnpm format       # Format code with Biome
```

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
pnpm lint         # Check for issues
pnpm format       # Auto-fix formatting
pnpm check        # Run both lint and format
```

## Architecture

### Authentication Flow

1. User accesses protected route under `/tasks`, `/calendar`, or `/pomodoro`
2. Redirected to WorkOS authentication via `_authed.tsx` loader
3. After successful login, user session stored via WorkOS AuthKit
4. All Convex queries automatically scoped to authenticated user

### Data Flow

```
UI Component → Convex Query/Mutation → Convex Database
     ↓              (Real-time)              ↓
 Auto-Update ←  Convex Subscription  ← Data Change
```

All data fetching uses Convex's real-time subscriptions via `useQuery`:

```tsx
const tasks = useQuery(api.tasks.getTasks);  // Auto-updates on changes
```

### Route Structure

- `/` - Dashboard with productivity overview
- `/tasks` - Task management (protected)
- `/calendar` - Calendar view (protected)  
- `/pomodoro` - Focus timer (protected)
- `/auth` - Authentication pages

All protected routes require WorkOS authentication via the `_authed` layout.

## Production Deployment

Build and deploy to production:

```bash
pnpm build    # Build frontend + validate backend
pnpm start    # Start production server
```

### Deployment Options

1. **Vercel** (Recommended) - See [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Railway** - PostgreSQL-ready with docker-compose.yml
3. **Render** - Dockerfile included
4. **Docker** - Full containerization support

### Pre-Deployment Checklist

- Set environment variables (see [ENV_SETUP.md](ENV_SETUP.md))
- Test locally: `pnpm build && pnpm start`
- Verify Convex deployment: Check Convex dashboard
- Configure WorkOS production credentials

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for 5-minute setup guide.

## Component Usage

### Adding a Task

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createTask = useMutation(api.tasks.createTask);

// Create a task with reminder
await createTask({
  title: "Study session",
  dueDate: new Date().toISOString(),
  reminderBefore: 15, // 15 minutes before
});
```

### Reading Productivity Stats

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const stats = useQuery(api.stats.getProductivityStats);
// Returns: { completedTasks, focusSessions, totalMinutes }
```

### Using Pomodoro Timer

The timer persists state to localStorage:

```tsx
import { PomodoroTimer } from "@/components/PomodoroTimer";

<PomodoroTimer />
// Default: 25 min work, 5 min break
// Automatically tracks sessions in Convex
```

## Adding shadcn/ui Components

Install new UI components as needed:

```bash
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add dialog
```

All components are configured for Tailwind CSS v4 and Radix UI.

## Learn More

- [Convex Documentation](https://docs.convex.dev)
- [TanStack Router](https://tanstack.com/router)
- [WorkOS AuthKit](https://workos.com/docs/authkit)
- [shadcn/ui Components](https://ui.shadcn.com)
- [FullCalendar](https://fullcalendar.io/docs/react)
