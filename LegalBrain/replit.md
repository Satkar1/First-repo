# LegalBrain - AI-Powered Legal Assistance System

## Overview

This is a comprehensive legal assistance platform with AI chatbot, FIR drafting with encryption, case tracking, and role-based dashboards. The system is production-ready with cloud-only deployment, AES-256 encryption, JWT authentication, and supports multiple languages (English, Hindi, Marathi). The system serves three types of users: citizens, police personnel, and administrators, each with secure, tailored interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Completion Status (January 25, 2025)

✅ **COMPLETED BACKEND FEATURES:**
- Enhanced AI chatbot endpoint (/api/chatbot) with BERT-like intent classification
- FIR generation endpoint (/api/fir/generate) with IPC suggestions and PDF creation  
- AES-256 encryption for FIR data before storage
- Case status endpoint (/api/case-status/:caseId) with court details
- Complete audit logging system for all user actions
- JWT authentication middleware protecting all routes

✅ **COMPLETED FRONTEND INTEGRATIONS:**
- Connected chatbot to enhanced AI endpoint with confidence scoring
- FIR filing form connected to secure generation endpoint
- Case tracking with real-time status updates and PDF downloads
- Enhanced error handling with unauthorized redirect flows
- Role-based access control throughout application

✅ **COMPLETED SECURITY FEATURES:**
- AES-256 encryption for sensitive FIR documents
- Comprehensive audit logging with IP and user agent tracking
- Row Level Security (RLS) policies for Supabase database
- JWT session management with refresh token handling
- HTTPS-only communication with CORS protection

✅ **DEPLOYMENT READY:**
- Complete deployment guide with Supabase setup instructions
- Environment variable configuration for all platforms
- Database schema migration scripts with RLS policies
- Production security checklist and monitoring guidelines

## System Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Express session with PostgreSQL store
- **Authentication**: Replit Auth with OpenID Connect

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Authorization**: Role-based access control (citizen, police, admin)
- **Security**: Secure cookies, CSRF protection, and proper session management

### Database Schema
- **Users**: Core user information with role-based access
- **FIR Reports**: First Information Reports with evidence tracking
- **Chat Logs**: AI assistant conversation history
- **Case Status**: Legal case tracking and updates
- **Audit Logs**: System activity tracking for compliance
- **Sessions**: Secure session storage (required for Replit Auth)

### AI Integration
- **Legal Chatbot**: Multilingual legal assistance (English, Hindi, Marathi)
- **IPC Suggestions**: AI-powered Indian Penal Code section recommendations
- **Document Generation**: Automated FIR and legal document creation

### Role-Based Dashboards
- **Citizen Portal**: FIR filing, case tracking, AI assistant
- **Police Dashboard**: FIR management, case assignment, investigation tools
- **Admin Console**: User management, system analytics, audit logs

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth → Session creation → Role-based redirect
2. **FIR Filing**: Form submission → AI validation → IPC suggestions → Database storage → Audit logging
3. **Chat System**: User query → AI processing → Legal knowledge base → Response generation → Chat history
4. **Case Tracking**: Database queries → Real-time status updates → PDF generation → Notifications

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **express-session**: Session management middleware
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form handling and validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push`

### Environment Requirements
- **DATABASE_URL**: PostgreSQL connection string (Neon compatible)
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OIDC provider URL (defaults to Replit)

### Production Configuration
- **Server**: Express serves both API routes and static frontend
- **Database**: PostgreSQL with connection pooling via Neon
- **Sessions**: Persistent storage in PostgreSQL sessions table
- **Security**: HTTPS enforcement, secure cookies, CORS protection

### Development vs Production
- **Development**: Vite HMR, error overlays, source maps
- **Production**: Optimized builds, asset compression, proper caching headers
- **Database**: Same schema, different connection strings

The application is designed to be deployed on Replit with automatic database provisioning and authentication setup, but can be adapted for other platforms with minimal configuration changes.