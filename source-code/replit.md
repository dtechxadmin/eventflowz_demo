# EventFlowz - Event Management System

## Overview

EventFlowz is a full-stack event management application designed for event planning businesses. It provides a comprehensive solution for managing events, contacts, and client relationships from initial inquiry through project completion. The system features a React frontend with TypeScript, Express.js backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **API Design**: RESTful endpoints with comprehensive error handling

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Strongly typed schema definitions with relations
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Data Models
- **Users**: Authentication and role management
- **Events**: Core event entity with status tracking and workflow management
- **Contacts**: Client and vendor contact management
- **Event Contacts**: Many-to-many relationship linking events to contacts

### Event Management Workflow
The system implements a comprehensive event lifecycle with these statuses:
- **Lead Stage**: inquiry, follow_up, icm, proposal, pay_retainer
- **Planning Stage**: pcm, 2cm, fcm, gdg
- **Completion Stage**: review, completed, cancelled

### Authentication System
- Session-based authentication with PostgreSQL session store
- Password hashing using bcrypt with salt rounds
- Protected routes with role-based access control
- Demo user capability for testing

### Form Handling
- Multi-step intake form for new event creation
- Client information, event details, and preferences collection
- Real-time validation with Zod schemas
- Progressive form saving and state management

## Data Flow

1. **User Authentication**: Users authenticate via login form, creating a session stored in PostgreSQL
2. **Event Creation**: Multi-step intake form collects event details and creates database records
3. **Event Management**: Dashboard provides overview with filtering and search capabilities
4. **Status Tracking**: Events progress through defined workflow stages with milestone tracking
5. **Contact Management**: Contacts are linked to events through junction table relationships

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: UI component primitives
- **passport**: Authentication middleware
- **bcrypt**: Password hashing
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-cartographer**: Replit integration

## Deployment Strategy

### Development Environment
- **Server**: Development server runs with tsx for hot reloading
- **Client**: Vite development server with HMR
- **Database**: Connected to Neon PostgreSQL instance
- **Session Store**: PostgreSQL-backed session storage

### Production Build
- **Client Build**: Vite builds optimized React application to `dist/public`
- **Server Build**: esbuild bundles TypeScript server code to `dist/index.js`
- **Static Serving**: Express serves built client files in production
- **Environment**: NODE_ENV-based configuration switching

### Database Management
- **Schema**: Shared schema definitions in `shared/schema.ts`
- **Migrations**: Generated in `migrations/` directory
- **Deployment**: `drizzle-kit push` for schema synchronization

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```