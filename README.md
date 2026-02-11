# Soulful Soups

Soulful Soups is a full-stack web application for ordering homemade soups and merchandise. It features a weekly menu, inventory tracking, special requests, and integrated payments.

## Features

- **Weekly Menu**: Browse a rotating selection of soulful soups.
- **Inventory Management**: Real-time tracking of soup and merchandise availability.
- **Special Requests**: Add custom notes to your orders with automatic upcharge handling.
- **User Accounts**: Secure sign-in via Replit Auth.
- **Admin Dashboard**: Manage products, stock levels, and view customer orders.
- **Responsive Design**: Warm, rustic theme that works great on all devices.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Zustand.
- **Backend**: Express.js, Node.js.
- **Database**: PostgreSQL, Drizzle ORM.
- **Authentication**: Replit Auth (OIDC).
- **Payment Processing**: Stripe (Mock mode enabled).

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   Ensure you have a PostgreSQL database and set the `DATABASE_URL` environment variable. Then sync the schema:
   ```bash
   npm run db:push
   ```

3. **Run the App**:
   ```bash
   npm run dev
   ```

## Admin Setup

To promote a user to admin, run the following SQL command in your database:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

## License

MIT
