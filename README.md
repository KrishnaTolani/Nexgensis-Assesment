# Product Admin Dashboard

A Next.js admin dashboard for managing products using the DummyJSON API.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Utilities**: clsx, tailwind-merge

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd product-admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Environment setup:
Create a `.env.local` file in the root (already included):
```bash
NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
product-admin-dashboard/
├── app/                    # Next.js App Router pages
├── components/            
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── products/          # Product-related components
│   └── layout/            # Layout components
├── lib/                   # Shared utilities and Axios setup
├── services/              # API service layer
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── context/               # React Context providers
└── public/                # Static assets
```

## Features Checklist

### Phase 1: Setup ✅
- [x] Next.js project with TypeScript
- [x] Tailwind CSS configuration
- [x] Project folder structure
- [x] Environment variables
- [x] Dependencies installed

### Phase 2: Core Infrastructure ✅
- [x] Axios instance with request/response interceptors
- [x] Auto-attach auth token to every request
- [x] Centralized 401/404/500 error handling
- [x] TypeScript types for Auth and Products
- [x] Utility functions (format, validate URL params, pagination)

### Phase 3: Authentication System ✅
- [x] Auth Service (login, save/clear auth, get token/user)
- [x] Auth Context with React Context API
- [x] useAuth custom hook
- [x] Protected Route component
- [x] Login page with validation and error handling
- [x] Prevent multiple submissions (button disabled)
- [x] Header component with logout button
- [x] Root layout wrapped with AuthProvider
- [x] Home page redirects based on auth status

### Phase 4-13: Coming Soon
- [ ] Authentication system
- [ ] Product list with pagination
- [ ] Search functionality
- [ ] Filter and sort
- [ ] Product details page
- [ ] Add/Edit/Delete products
- [ ] Loading and error states

## API Information

This project uses the free [DummyJSON API](https://dummyjson.com):
- **Base URL**: https://dummyjson.com
- **Auth**: Username: `emilys`, Password: `emilyspass`

## Development Notes

- All commits will be made incrementally per feature
- No single large commit
- Each phase is documented and testable

## License

This is an assignment project for Nexgensis.

---

**Status**: Phase 1 Complete - Initial Setup ✅
