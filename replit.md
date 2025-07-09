# BCI Neural Interface System

## Overview

This is a Brain-Computer Interface (BCI) application designed for neural signal processing and cursor control. The system captures EEG neural signals, processes them in real-time, and translates brain activity into cursor movements for target-based interaction tasks. It features a modern web interface built with React and a real-time backend using WebSocket communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Real-time Communication**: WebSocket server for neural data streaming
- **Database**: PostgreSQL with Drizzle ORM
- **API Pattern**: REST endpoints for session management, WebSocket for real-time data

### Key Components

#### Neural Signal Processing
- **Signal Generator**: Simulates realistic EEG signals with motor cortex activity (C3/C4 channels)
- **Neural Processor**: Decodes movement intentions from neural signals and translates to cursor movement
- **Frequency Band Analysis**: Processes Alpha, Beta, Gamma, and Theta frequency bands
- **Classification System**: Categorizes neural activity as 'left', 'right', or 'rest' states

#### User Interface Components
- **BCI Interface**: Main application page with real-time neural signal visualization
- **Cursor Control Area**: Interactive canvas for cursor movement and target interaction
- **Analytics Dashboard**: Performance metrics and system status monitoring
- **Neural Signal Chart**: Real-time visualization of C3/C4 motor cortex signals

#### Data Models
- **Users**: Authentication and user management
- **Sessions**: BCI training/testing sessions with performance metrics
- **Neural Signals**: Raw EEG data with frequency band analysis
- **Cursor Positions**: Cursor movement tracking with target proximity
- **Target Events**: User interaction events (hits, misses, timeouts)

## Data Flow

1. **Neural Signal Generation**: Backend generates simulated EEG signals with realistic motor cortex patterns
2. **Real-time Processing**: Neural processor analyzes signals and converts to cursor movement commands
3. **WebSocket Communication**: Processed data streams to frontend via WebSocket connection
4. **UI Updates**: React components update in real-time with neural data and cursor positions
5. **User Interaction**: Target hits/misses are tracked and stored in the database
6. **Performance Analytics**: Session metrics are calculated and displayed on the dashboard

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon cloud database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@radix-ui/react-***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management and caching
- **ws**: WebSocket server implementation
- **express**: Web application framework

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **drizzle-kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR for frontend, tsx for backend hot reload
- **Database**: PostgreSQL via Neon cloud service
- **WebSocket**: Development server supports WebSocket connections on same port

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database Migrations**: Drizzle kit manages schema changes via `db:push` command
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection

### Architecture Benefits
- **Real-time Performance**: WebSocket ensures low-latency neural data streaming
- **Type Safety**: Full TypeScript coverage from database to UI components
- **Scalable UI**: Radix UI provides accessible, customizable components
- **Database Flexibility**: Drizzle ORM supports easy schema changes and migrations
- **Modern Development**: Vite provides fast builds and excellent developer experience

### Considerations
- The neural signal processing currently uses simulated data - real EEG hardware integration would require additional drivers
- WebSocket connections need proper error handling and reconnection logic for production
- Database queries could benefit from indexing for large datasets
- The application assumes a single user model but could be extended for multi-user scenarios