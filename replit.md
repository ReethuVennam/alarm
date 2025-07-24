# Smart Alarm & Timer Web App

## Overview

This is a modern responsive alarm and timer web application that supports both natural language input and traditional UI controls. The application allows users to create alarms using natural language commands like "Remind me to pay credit card bill every 2nd of the month at 6pm" or through traditional form inputs with date pickers, time selectors, and repeat options.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom theme support and dark/light mode
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Style**: RESTful APIs with JSON responses
- **Validation**: Zod schemas shared between client and server

### Key Components

#### Natural Language Processing
- **Parser**: chrono-node for extracting dates and times from natural language
- **Custom Logic**: Built-in parsing for recurring patterns (daily, weekly, monthly)
- **Preview System**: Shows parsed values before alarm creation

#### Alarm Management
- **CRUD Operations**: Create, read, update, delete alarms
- **Repeat Types**: None, daily, weekly, monthly with configurable values
- **Sound Control**: Toggle-able alarm sounds with Web Audio API
- **Snooze Functionality**: Built-in snooze with configurable duration
- **Search Feature**: Real-time filtering of alarms by title, description, or time
- **Do Not Disturb Mode**: Block all alarm notifications for a specified duration with visual indicators

#### Audio System
- **Web Audio API**: Primary audio system for alarm sounds
- **Fallback**: HTML5 Audio for browsers without Web Audio support
- **Sound Generation**: Programmatic tone generation for alarm sounds
- **Volume Control**: Configurable alarm volume

#### Theme System
- **Dark/Light Mode**: Complete theme switching with CSS variables
- **Persistent Storage**: Theme preference saved in localStorage
- **Tailwind Integration**: CSS custom properties for consistent theming

## Data Flow

1. **Alarm Creation**: User inputs natural language or uses traditional form → Client validates with Zod → API call to server → Server validates and stores in database
2. **Alarm Monitoring**: Client polls server for active alarms → Real-time countdown display → Triggers notification when alarm time reached
3. **Alarm Notification**: Browser notification API + Web Audio API sound → Modal dialog with snooze/dismiss options
4. **State Synchronization**: React Query handles cache invalidation and updates across components

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **chrono-node**: Natural language date/time parsing
- **wouter**: Lightweight routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitive components
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **esbuild**: Server-side bundling for production

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL with connection pooling via Neon

### Database Schema
- **Alarms Table**: Stores alarm data with trigger times, repeat patterns, and settings
- **Users Table**: Basic user management (currently unused but prepared)
- **Migrations**: Managed through Drizzle Kit with version control

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Development**: Replit-specific configurations for development environment
- **Production**: Node.js server serving static files and API endpoints

The application is designed to be deployed on platforms like Replit, Vercel, or any Node.js hosting service with PostgreSQL database support.