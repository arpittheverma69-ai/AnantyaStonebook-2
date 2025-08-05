# replit.md

## Overview

Anantya is a custom CRM application built for a premium gemstone trading business. The system is designed as an offline-first application to support field sales operations and in-person consultations. It provides comprehensive modules for managing the entire gemstone business workflow including inventory management, client relationships, supplier coordination, sales transactions, certification tracking, and financial analysis.

The application features a modern web interface built with React and shadcn/ui components, with a robust backend using Express.js and PostgreSQL database. The system supports file uploads for certification documents and provides detailed business analytics through dashboard widgets and financial reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library based on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom gemstone-inspired color variables and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud database
- **File Handling**: Multer middleware for handling document uploads (certificates, images)
- **API Design**: RESTful API with consistent error handling and logging middleware
- **Environment**: ESM modules with TypeScript compilation via tsx for development

### Database Schema Design
- **Core Entities**: Inventory (gemstones), Clients, Suppliers, Sales, Certifications, Consultations, Tasks
- **Relationships**: Foreign key relationships between entities (e.g., inventory linked to suppliers, sales linked to clients and stones)
- **Data Types**: Decimal precision for financial calculations, JSON arrays for tags and flexible data, timestamps for audit trails
- **Indexing Strategy**: Primary keys using UUIDs, unique constraints on business identifiers (stone IDs, sale IDs)

### Authentication & Authorization
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- Middleware-based request logging and error handling
- CORS configuration for secure cross-origin requests

### File Management System
- Local file storage in `/uploads` directory with size and type restrictions
- Support for common document formats (PDF, DOC, DOCX) and images (JPEG, PNG)
- 10MB file size limit with proper error handling and validation

### Offline-First Capabilities
- Client-side data caching using TanStack Query for offline data access
- Responsive design optimized for mobile field sales operations
- Service worker integration ready for PWA functionality

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL provider for cloud database hosting
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling Framework
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Frontend build tool with HMR and optimization
- **TypeScript**: Static type checking for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for Node.js development

### Form & Validation Libraries
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

### Data Fetching & State Management
- **TanStack Query**: Server state management with caching and synchronization
- **date-fns**: Date manipulation and formatting utilities

### Development Environment Integration
- **Replit-specific plugins**: Cartographer for development tooling and runtime error modal
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer