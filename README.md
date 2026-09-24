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
git clone https://github.com/KrishnaTolani/Nexgensis-Assesment.git
cd Nexgensis-Assesment
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
Nexgensis-Assesment/   ← repo root (this is the project root)
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

### Phase 4: Product List Page ✅
- [x] Product Service with all CRUD operations
- [x] Get products with pagination, search, category filter
- [x] useDebounce hook (500ms delay for search)
- [x] useURLParams hook (manage page, limit, search, category, sort in URL)
- [x] Product list page with full logic:
  - Fetch products from API
  - Search with debounce
  - Filter by category
  - Sort by price, rating, title (client-side)
  - Pagination (previous/next)
  - Loading, error, empty states
  - Race condition prevention (AbortController)
- [x] API limitation handling (search clears category filter)

### Phase 5: UI Components ✅
- [x] SearchBar with loading spinner and clear button
- [x] FilterSort with category dropdown and sort options (with optgroups)
- [x] Info message when search disables category filter
- [x] Pagination with page numbers + ellipsis (1…5,6,7…20 pattern)
- [x] Page size selector (10, 20, 50) 
- [x] "Showing X–Y of Z results" text
- [x] Loader, ErrorMessage (with Retry), EmptyState, Modal UI components
- [x] Products page updated to use all new components

### Phase 7: Product Details Page ✅
- [x] Product detail page at `/products/[id]`
- [x] Image gallery with thumbnail strip (click to switch main image)
- [x] Product info: title, brand, category, price, discount, rating, description
- [x] Key details grid: stock, SKU, weight, min order quantity
- [x] Shipping, warranty, return policy info
- [x] Tags display
- [x] Customer reviews with star ratings and dates
- [x] "Not Found" page for invalid or missing product IDs
- [x] Validates non-numeric IDs (e.g. `/products/abc`) → shows not-found
- [x] Error state with Retry button
- [x] Edit Product button linking to edit page

### Phase 8: Add & Edit Product ✅
- [x] ProductForm component (shared for add and edit)
- [x] Validation: title (min 3 chars), description (min 10), price (>0), stock (≥0, integer), category (required), thumbnail (valid URL)
- [x] Inline field error messages
- [x] Category dropdown populated from API
- [x] Thumbnail URL preview
- [x] Prevent multiple submissions (button disabled during request)
- [x] API note banner (explains data won't persist)
- [x] Add Product page at `/products/add`
- [x] Edit Product page at `/products/edit/[id]`
- [x] Edit page pre-fills form with existing product data
- [x] Handles invalid/missing product ID on edit page
- [x] Redirects to product list (add) or product detail (edit) on success

### Phase 9: Edge Cases & Refinements ✅
- [x] Fixed categories API — now returns `{slug, name, url}` objects, not plain strings
- [x] AbortSignal passed directly into service calls (race condition prevention tested with &delay=2000)
- [x] Out-of-range page numbers (?page=9999) → clamped to last valid page after data loads
- [x] Invalid page strings (?page=abc) → silently default to page 1
- [x] Invalid limit values (?limit=7) → default to 10
- [x] Invalid sortBy values → ignored, no sort applied
- [x] useURLParams refactored: cleaner validation, uses pathname for proper URL building
- [x] Product service: added AbortSignal support, clarified API limitation comments

### Phase 10: Layout & Final Wiring ✅
- [x] Header upgraded: sticky, logo with icon, desktop nav links with active states
- [x] Mobile hamburger menu with nav links and logout
- [x] Root layout improved with proper min-height calc
- [x] Dynamic page title template (`%s | Product Admin`)
- [x] Global 404 not-found page
- [x] Button and Badge reusable UI components
- [x] Login page: auto-fill button for demo credentials

### Phase 11: QA & Accessibility ✅
- [x] Retry button now actually re-triggers the fetch (fixed stale closure issue)
- [x] Delete errors surface in the UI instead of silent console.error
- [x] `aria-live` region announces search result changes to screen readers
- [x] `role="status"` on Loader with sr-only text
- [x] `aria-label` on search input
- [x] `scope="col"` on all table headers
- [x] `focus-visible` keyboard ring in globals.css
- [x] `sr-only` utility class in globals.css
- [x] `line-clamp-2` utility in globals.css
- [x] ProtectedRoute uses Loader component instead of inline spinner

### Phase 12-13: Coming Soon

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

**Status**: Phase 5 Complete - Search, Filter, Pagination UI ✅
