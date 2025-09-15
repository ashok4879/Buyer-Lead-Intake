# Buyer Lead Management Application

A comprehensive application for managing real estate buyer leads with role-based access control, CSV import/export functionality, and detailed buyer tracking. This project is built with [Next.js](https://nextjs.org).

## Features

- **User Authentication**: Secure login and registration with NextAuth
- **Role-Based Access Control**: Admin and regular user roles with appropriate permissions
- **Buyer Lead Management**: Create, view, update, and delete buyer leads
- **Status Tracking**: Track buyer lead status through the sales pipeline
- **Notes Management**: Add and update notes for each buyer lead
- **CSV Import/Export**: Easily import and export buyer data
- **Admin Dashboard**: View statistics and manage users
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables by creating a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/buyer_lead_app"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with initial data (creates admin and regular user accounts):
   ```bash
   npm run prisma:seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default User Accounts

After running the seed script, you can log in with the following accounts:

- **Admin User**:
  - Email: admin@example.com
  - Password: password123

- **Regular User**:
  - Email: user@example.com
  - Password: password123

## Usage

### Managing Buyer Leads

1. **Creating a Lead**: Navigate to "New Lead" and fill out the form
2. **Viewing Leads**: Go to the "Leads" page to see all your leads
3. **Updating a Lead**: Click on a lead to view details and make changes
4. **Changing Status**: Use the status dropdown to update the lead's status
5. **Adding Notes**: Add notes to keep track of interactions with the lead

### Importing and Exporting Data

1. **Importing Leads**: Go to "Import/Export" page, select a CSV file, and click "Import"
2. **Exporting Leads**: Go to "Import/Export" page, select filters if needed, and click "Export to CSV"

### Admin Features

1. **Dashboard**: View statistics about leads, users, and activity
2. **User Management**: Manage user roles (promote to admin or demote to regular user)

## CSV Format

When importing leads, your CSV file should have the following headers:

```
fullName,email,phone,city,propertyType,bhk,purpose,timeline,budget,source,status,notes
```

Example row:
```
John Doe,john@example.com,1234567890,Mumbai,Apartment,2,Investment,3-6 Months,5000000,Website,New,Interested in sea view
```

## Security

The application implements several security measures:

1. **Authentication**: Secure login with NextAuth
2. **Authorization**: Role-based access control for different features
3. **Data Ownership**: Users can only access their own leads unless they have admin privileges
4. **Input Validation**: All inputs are validated using Zod schema validation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
