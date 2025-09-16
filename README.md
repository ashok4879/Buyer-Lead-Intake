# Buyer Lead Management Application

A comprehensive application for managing real estate buyer leads with role-based access control, CSV import/export functionality, and detailed buyer tracking. Built with [Next.js](https://nextjs.org).

---

## Features

- **User Authentication**: Secure login and registration with NextAuth
- **Role-Based Access Control**: Admin and regular user roles with appropriate permissions
- **Buyer Lead Management**: Create, view, update, and delete buyer leads
- **Status Tracking**: Track buyer lead status through the sales pipeline
- **Notes Management**: Add and update notes for each buyer lead
- **CSV Import/Export**: Easily import and export buyer data
- **Admin Dashboard**: View statistics and manage users
- **Responsive Design**: Works on desktop and mobile devices

---

## Setup

### Prerequisites

- Node.js v18+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
2. Install dependencies:
npm install
# or
yarn install
3. .env file
DATABASE_URL="postgresql://username:password@localhost:5432/buyer_lead_app"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
4. database migrations
npx prisma migrate dev
5. database selection
npm run prisma:seed
6. setup servers
npm run dev


7.Design Notes
Validation
Inputs validated with Zod schemas
Validation occurs both client-side (feedback) and server-side (security)
SSR vs Client Rendering
SSR: Pages needing authentication or data fetching
Client: Inline editing, status updates, and notes interactions
Ownership Enforcement
Users can only access/modify their own leads
Admins can access all leads
Enforced at API route and database query level
Security

Authentication: Secure login with NextAuth
Authorization: Role-based access control
Data Ownership: Users can only access their own leads
Input Validation: All inputs validated using Zod schemas
8.Done vs Skipped
Done

Authentication and registration
Role-based access control
CRUD for leads
Notes management
Status tracking
CSV import/export
Admin dashboard
Responsive UI

Skipped / Deferred

Advanced analytics (charts, forecasts)
Real-time notifications
Full test coverage
Multi-tenant support

