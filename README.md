# Smart Alarm & Timer Web App

A modern responsive alarm and timer web application that supports both natural language input and traditional UI controls.

## Features

- **Natural Language Processing**: Set alarms with commands like "Remind me to pay bills every 2nd at 6pm"
- **Traditional UI Controls**: Full form interface with date/time pickers and repeat options
- **Real-time Scheduling**: Browser-based alarm scheduling with notifications
- **Dark/Light Theme**: Complete theme switching with persistent storage
- **Do Not Disturb Mode**: Temporary notification blocking
- **Search & Filtering**: Real-time alarm filtering by title, description, or time

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Vercel Serverless Functions
- **Database**: PostgreSQL with Drizzle ORM (Neon Database)
- **UI**: Radix UI + Tailwind CSS
- **State Management**: React Query (TanStack Query)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Database migrations
npm run db:push
```

## Environment Variables

Create a `.env` file with:

```bash
DATABASE_URL=your_postgresql_connection_string
```

## Deployment to Vercel

This app is configured for Vercel deployment with:

1. **Static Frontend**: Built to `dist/public/` 
2. **Serverless Functions**: API routes in `api/` directory
3. **Auto-deployment**: Push to main branch triggers deployment

### Deploy Steps:

1. Connect your GitHub repo to Vercel
2. Set `DATABASE_URL` environment variable in Vercel dashboard
3. Deploy automatically on push to main branch

### Vercel Configuration:

- Build command: `vite build` (frontend only)
- Output directory: `dist/public`
- API functions: `api/alarms.ts` and `api/alarms/[id].ts`

## API Endpoints

- `GET /api/alarms` - Get all alarms
- `POST /api/alarms` - Create new alarm
- `GET /api/alarms/[id]` - Get specific alarm
- `PATCH /api/alarms/[id]` - Update alarm
- `DELETE /api/alarms/[id]` - Delete alarm

## Project Structure

```
├── api/                    # Vercel serverless functions
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and services
│   │   └── pages/          # Route components
├── server/                 # Original Express server (for local dev)
├── shared/                 # Database schema and types
├── dist/public/           # Built frontend files
└── vercel.json            # Vercel configuration
```

## Natural Language Examples

- "Remind me to take medicine at 8am daily"
- "Alarm me to call mom tomorrow at 3pm"
- "Set timer for 25 minutes" (Pomodoro technique)
- "Don't disturb for 2 hours"
- "Wake me up next Monday at 7am"

## License

MIT License