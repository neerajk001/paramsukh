# ParamSukh Admin Panel

Modern Next.js 16 admin panel for the ParamSukh platform.

## Features

- 🔐 **Secure Authentication** - Simple email/password authentication
- 📊 **Dashboard** - Overview of all platform statistics
- 👥 **User Management** - View and manage all users
- 📚 **Course Management** - Create and manage courses with videos
- 📅 **Event Management** - Organize and track events
- 🛍️ **Product Management** - Manage marketplace products
- 📦 **Order Tracking** - Monitor and manage orders
- 📅 **Booking Management** - Handle counseling bookings
- 💬 **Community Moderation** - Manage posts and comments
- 🔔 **Notifications** - Send and manage notifications

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
ADMIN_EMAIL=admin@paramsukh.com
ADMIN_PASSWORD=admin123
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

### Default Credentials

- **Email**: admin@paramsukh.com
- **Password**: admin123

## Project Structure

```
admin/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── users/         # User management
│   │   ├── courses/       # Course management
│   │   ├── events/        # Event management
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   ├── bookings/      # Booking management
│   │   ├── community/     # Community management
│   │   └── notifications/ # Notification management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login page
├── components/
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── Header.tsx         # Top header
├── lib/
│   ├── api/
│   │   └── client.ts      # Axios API client
│   └── store/
│       └── authStore.ts   # Authentication state
└── public/                # Static assets

## Color Scheme

- **Primary**: Orange (#FF6B35)
- **Secondary**: Black (#1A1A1A)
- **Accent**: Grey (#6C757D)

## API Integration

The admin panel communicates with the backend API at the configured `NEXT_PUBLIC_API_URL`. All API calls are made through the Axios client configured in `lib/api/client.ts`.

## Building for Production

```bash
npm run build
npm start
```

## Notes

- The admin panel runs on port 3001 by default
- Ensure the backend API is running before starting the admin panel
- All routes under `/dashboard` are protected and require authentication
- Session data is persisted in localStorage

## Migration from AdminJS

This admin panel replaces the previous AdminJS implementation with a custom Next.js solution, providing:
- Better customization and control
- Modern UI/UX with Tailwind CSS
- Improved performance
- Type safety with TypeScript
- Easier maintenance and extensibility
