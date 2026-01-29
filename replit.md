# MoodleHub - Headless LMS Frontend

## Overview

MoodleHub is a modern, headless frontend application for Moodle LMS (Learning Management System). It provides a React-based web interface for browsing courses, tracking learning progress, viewing grades, and managing calendar events. The application is designed to connect to a Moodle backend via API, though it currently operates with demo data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite for development and production builds

The frontend follows a page-based architecture with shared components. Pages include Dashboard, Courses, Course Detail, Calendar, Grades, and Settings. The application supports light/dark theme switching with system preference detection.

### Backend Architecture
- **Framework**: Express.js 5 running on Node.js
- **Language**: TypeScript with ES modules
- **HTTP Server**: Node.js native HTTP server
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix

The backend serves both the API endpoints and static files in production. In development, Vite middleware handles frontend assets with hot module replacement.

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Validation**: Zod for runtime type validation
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Current State**: Uses in-memory demo data storage; database integration prepared but not active

The schema defines Moodle-compatible data types: Users, Courses, Categories, Sections, Activities, Calendar Events, and Grade Items.

### Build System
- **Frontend Build**: Vite compiles React/TypeScript to static assets in `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.cjs`
- **Development**: TSX runs TypeScript directly with Vite dev server integration

## External Dependencies

### Database
- PostgreSQL database (required for production)
- Connection via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations (`npm run db:push`)

### Session Management
- connect-pg-simple for PostgreSQL session storage (prepared, not currently active)

### UI Dependencies
- Radix UI primitives for accessible component foundations
- Embla Carousel for carousel functionality
- React Day Picker for calendar components
- Recharts for data visualization (charts)
- Vaul for drawer components

### Development Tools
- Replit-specific plugins for development (error overlay, cartographer, dev banner)
- TypeScript for type checking across client, server, and shared code