# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Smart Alarm & Timer Web Application** that supports both natural language commands ("Remind me to pay credit card bill every 2nd of the month at 6pm") and traditional UI controls. Built as a full-stack TypeScript application with React frontend and Express backend.

## Development Commands

```bash
# Development
npm run dev          # Start development server (both client and server)
npm run build        # Build production bundle (client + server)
npm run start        # Start production server
npm run check        # Run TypeScript type checking

# Database
npm run db:push      # Push database schema changes using Drizzle Kit
```

## Architecture Overview

### Full-Stack Structure
- **Frontend**: React 18 + TypeScript + Vite (in `client/` directory)
- **Backend**: Express.js + TypeScript (in `server/` directory) OR Vercel serverless functions (in `api/` directory)
- **Database**: PostgreSQL with Drizzle ORM (schema in `shared/`)
- **Build System**: Vite for client, esbuild for server bundling

### Deployment Flexibility
The project supports two deployment approaches:
- **Local/Traditional**: Express server with `npm run dev` for full-stack development
- **Vercel**: Serverless functions in `api/` directory with static frontend deployment

### Key Directories
- `client/src/` - React application source code
- `server/` - Express API server and routes (local development)
- `api/` - Vercel serverless functions (production deployment)
- `shared/` - Database schema and types shared between client/server
- `dist/` - Production build output

### Path Aliases (configured in vite.config.ts and tsconfig.json)
- `@/*` - Points to `client/src/*`
- `@shared/*` - Points to `shared/*`
- `@assets/*` - Points to `attached_assets/*`

## Database Architecture

### Drizzle ORM Setup
Database schema is defined in `shared/schema.ts` with three main tables:

**Alarms Table** (`alarms`):
- Core alarm functionality with natural language and traditional input support
- Supports recurring patterns (none, daily, weekly, monthly)
- Sound control and active/inactive states

**Timer Sessions Table** (`timerSessions`):
- Tracks timed activities with start/end times, duration, notes, and mood
- Supports goal setting and activity categorization

**Activities Table** (`activities`):
- Predefined activity types with default durations
- Customizable activity categories for timers

### Database Operations
- Connection: Neon Database with `@neondatabase/serverless`
- Migrations: Managed through `drizzle-kit` (config in `drizzle.config.ts`)
- Environment: Requires `DATABASE_URL` environment variable

## Frontend Architecture

### State Management & Data Fetching
- **React Query** (`@tanstack/react-query`) for server state management
- **Custom Hooks**: `useAlarms.ts` provides comprehensive alarm management with:
  - Real-time alarm scheduling using `AlarmScheduler` class
  - Browser notification management via `NotificationManager`
  - CRUD operations with optimistic updates and cache invalidation

### Natural Language Processing
Located in `client/src/lib/alarmUtils.ts`:
- **chrono-node** for date/time extraction from natural language
- Custom parsing for relative times ("in 5 minutes") and absolute times ("at 3pm")
- Support for recurring patterns and special commands (Do Not Disturb mode)
- Smart task title extraction with contextual notification messages

### UI Components System
- **Radix UI** primitives for accessible components
- **shadcn/ui** component system in `client/src/components/ui/`
- **Tailwind CSS** with custom theme support and dark/light mode
- **Wouter** for lightweight client-side routing

### Key Frontend Features
- **Multi-Feature App**: Integrated alarm, timer, stopwatch, and world clock functionality
- **Real-time Countdown**: Live updates showing time remaining for active alarms
- **Audio System**: Web Audio API with fallback to HTML5 Audio for alarm sounds
- **Theme System**: Dark/light mode with persistent storage
- **Search & Filtering**: Universal search across alarms, timers, and world clock locations
- **Do Not Disturb Mode**: Temporary notification blocking with visual indicators
- **Mobile-First Design**: Responsive layout with touch-friendly interactions
- **Accessibility**: Screen reader support and keyboard navigation via Radix UI primitives

## Backend Architecture

### API Structure
- **RESTful APIs** with JSON responses in `server/routes.ts`
- **Express.js** with TypeScript and ES modules
- **Shared Zod schemas** for request/response validation
- **Error handling** with custom middleware

### Server Features
- **Development**: tsx with hot reloading
- **Production**: esbuild bundling to `dist/index.js`
- **Static serving**: Vite-built client assets served from `dist/public/`
- **Logging**: Custom request/response logging for API endpoints

## Testing & Quality

### Type Safety
- **Strict TypeScript** configuration across client and server
- **Zod validation** for runtime type checking on API boundaries
- **Drizzle ORM** provides compile-time type safety for database operations

### Code Quality
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Component Architecture**: Feature-based organization in `client/src/components/features/`
- **Custom Hooks**: Centralized business logic in `client/src/hooks/`
- **Utility Libraries**: Helper functions in `client/src/lib/` and `client/src/utils/`

## Development Workflow

### Local Development
1. Ensure `DATABASE_URL` environment variable is set
2. Run `npm run dev` to start both client and server in development mode
3. Vite provides HMR for client-side changes
4. Server restarts automatically with tsx

### Database Changes
1. Modify schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes to database
3. Drizzle Kit handles migration generation and execution

### Production Build
1. `npm run build` creates optimized client bundle and server bundle
2. Client assets go to `dist/public/`, server bundle to `dist/index.js`
3. `npm run start` serves the production build

## Development Patterns

### Component Organization
- **Feature-based structure**: Components grouped by functionality in `client/src/components/features/`
- **Shared UI components**: Reusable components in `client/src/components/ui/` (shadcn/ui)
- **Layout components**: App structure components in `client/src/components/layout/`
- **Page components**: Route-specific components in `client/src/pages/`

### State Management Patterns
- **Server state**: React Query for API data fetching and caching
- **Client state**: React hooks and context for local component state
- **Persistent state**: localStorage for theme preferences and settings
- **Real-time updates**: Custom hooks with cleanup patterns for timers and alarms

### Error Handling
- **API errors**: Centralized error handling in React Query mutations
- **Client errors**: ErrorBoundary component for component-level error catching
- **Validation**: Zod schemas for both client and server-side validation
- **User feedback**: Toast notifications for user actions and errors

## Key Implementation Details

### Alarm Scheduling System
The `AlarmScheduler` class in `alarmUtils.ts` provides:
- Precise setTimeout-based scheduling with 24-hour maximum delays
- Automatic rescheduling for recurring alarms
- Browser notification integration with `NotificationManager`
- Cleanup and memory management for scheduled alarms

### Natural Language Parsing
Advanced parsing in `parseNaturalLanguage()` function handles:
- Relative times: "in 30 minutes", "in 2 hours"
- Absolute times: "at 3pm", "at 2:30pm"
- Date specifications: "tomorrow", "next monday", "every day"
- Special commands: "don't disturb for 1 hour"
- Smart title extraction and contextual notification messages

### Data Flow
1. **User Input**: Natural language or form data → Client validation with Zod
2. **API Call**: React Query mutation → Server validation → Database storage
3. **Real-time Updates**: Cache invalidation → UI updates → Alarm scheduling
4. **Notifications**: `AlarmScheduler` triggers → Browser notifications + custom handlers

## Environment Setup

### Required Environment Variables
```bash
# Storage Configuration
VITE_USE_LOCALSTORAGE=true|false        # Use localStorage (true) or database (false)

# Database Configuration (only required when VITE_USE_LOCALSTORAGE=false)
DATABASE_URL=postgresql://...           # Neon Database connection string

# Development settings
NODE_ENV=development|production         # Environment mode
PORT=5000                              # Server port (optional, defaults to 5000)
```

### Storage Configuration
The application supports two storage modes:
- **localStorage Mode** (`VITE_USE_LOCALSTORAGE=true`): Stores all alarm data in browser localStorage
- **Database Mode** (`VITE_USE_LOCALSTORAGE=false`): Stores alarm data in PostgreSQL database

**To switch storage modes:**
1. Update `VITE_USE_LOCALSTORAGE` in your `.env` file
2. Restart the development server
3. The `useAlarmsAdapter` hook will automatically use the appropriate storage method

### Replit-Specific Configuration
The project includes Replit-specific development plugins in `vite.config.ts` for enhanced development experience on the Replit platform.