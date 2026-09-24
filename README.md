# Product Admin Dashboard

A full-featured admin dashboard for managing products built with Next.js, TypeScript, and Tailwind CSS, using the [DummyJSON API](https://dummyjson.com).

**Live Demo**: *(add Vercel URL after deployment)*
**Repository**: https://github.com/KrishnaTolani/Nexgensis-Assesment

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| React | 19 | UI Library |
| TypeScript | 5 | Type Safety |
| Tailwind CSS | 4 | Styling |
| Axios | 1.x | HTTP Client |
| clsx + tailwind-merge | latest | Class utilities |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KrishnaTolani/Nexgensis-Assesment.git
cd Nexgensis-Assesment

# 2. Install dependencies
npm install

# 3. Create environment file
echo "NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com" > .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Field | Value |
|---|---|
| Username | `emilys` |
| Password | `emilyspass` |

> The login page has an **Auto-fill** button — no need to type manually.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
Nexgensis-Assesment/
├── app/
│   ├── layout.tsx            # Root layout with AuthProvider + Header
│   ├── page.tsx              # Home — redirects to /login or /products
│   ├── not-found.tsx         # Global 404 page
│   ├── globals.css           # Global styles
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── products/
│       ├── page.tsx          # Product list with search/filter/sort/pagination
│       ├── add/
│       │   └── page.tsx      # Add product form
│       ├── [id]/
│       │   ├── page.tsx      # Product details
│       │   └── not-found.tsx # Product-specific 404
│       └── edit/[id]/
│           └── page.tsx      # Edit product form
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   └── Header.tsx        # Sticky header with mobile menu
│   ├── products/
│   │   ├── SearchBar.tsx
│   │   ├── FilterSort.tsx
│   │   ├── Pagination.tsx
│   │   ├── ProductTable.tsx  # Desktop view
│   │   ├── ProductCard.tsx   # Mobile view
│   │   └── ProductForm.tsx   # Shared add/edit form
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Loader.tsx
│       ├── ErrorMessage.tsx
│       ├── EmptyState.tsx
│       └── Modal.tsx
├── context/
│   └── AuthContext.tsx       # Global auth state
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts        # 500ms debounce for search
│   └── useURLParams.ts       # URL query param manager
├── lib/
│   ├── axios.ts              # Shared Axios instance with interceptors
│   └── utils.ts              # Helpers: format, validate, pagination
├── services/
│   ├── auth.service.ts       # Login, token management
│   └── product.service.ts    # All product API calls
└── types/
    ├── auth.types.ts
    └── product.types.ts
```

---

## Features Completed

### Authentication
- [x] Login with `emilys` / `emilyspass` via `POST /auth/login`
- [x] Error messages for wrong credentials
- [x] Protected routes — redirect to login if not authenticated
- [x] Logout button in header (desktop + mobile)
- [x] Token persisted in `localStorage`, restored on page refresh
- [x] Prevents multiple login submissions

### Product List
- [x] Table layout on desktop (image, title, category, price, rating, stock, actions)
- [x] Card layout on mobile
- [x] Loading spinner while fetching
- [x] Error state with Retry button
- [x] Empty state with clear filters option

### Pagination
- [x] API-driven pagination using `limit` and `skip`
- [x] Page number buttons with `...` ellipsis pattern
- [x] Previous / Next buttons
- [x] Page size selector: 10, 20, 50
- [x] "Showing 21–40 of 194 results" text

### Search
- [x] Debounced search (500ms) — calls `GET /products/search?q=`
- [x] Resets to page 1 on new search
- [x] Clear (✕) button in search input
- [x] Loading indicator during search

### Filter & Sort
- [x] Filter by category — fetched from `GET /products/categories`
- [x] Sort by price, rating, title (ascending/descending) — client-side
- [x] Clear All button removes all active filters
- [x] Info message when search disables category filter

### Product Details (`/products/[id]`)
- [x] Image gallery with clickable thumbnail strip
- [x] Full product info: price, rating, description, stock, SKU, dimensions
- [x] Shipping, warranty and return policy
- [x] Tags
- [x] Customer reviews with star ratings and dates
- [x] 404 page for invalid/missing product IDs

### Add / Edit / Delete
- [x] Add product form at `/products/add`
- [x] Edit product form at `/products/edit/[id]` (pre-filled)
- [x] Form validation: required fields, min lengths, number ranges, URL format
- [x] Inline field-level error messages
- [x] Thumbnail URL preview
- [x] Delete with confirmation modal
- [x] Prevents multiple form submissions
- [x] Optimistic UI updates (see Design Decisions)

---

## Design Decisions & Trade-offs

### 1. Search vs Category Filter (API Limitation)

**Problem**: DummyJSON does not support searching and filtering by category simultaneously. `GET /products/search?q=phone&category=smartphones` is not a supported endpoint.

**Decision**: Search takes priority. When the user types in the search box, the category filter is automatically cleared and disabled. An info banner explains this to the user. When search is cleared, the category filter becomes available again.

**Why**: Search is more specific and usually produces the exact results the user wants. Disabling an already-applied category filter silently would confuse users, so we explain it with a visible message.

---

### 2. Add / Edit / Delete — Fake API Persistence

**Problem**: DummyJSON simulates write operations but does not actually persist data. A deleted product will reappear on page refresh.

**Decision**: Optimistic UI updates — changes are applied to the local React state immediately after the API returns success. A banner on the form explains that changes are simulated.

**Approach**:
- **Delete**: Product removed from the `products` state array immediately.
- **Add**: API returns a fake product with a new ID — we redirect to the product list.
- **Edit**: API returns the updated product — we redirect to the product detail page.

On page refresh, the local state is gone and the API returns the original unmodified data, which is the expected behavior for a fake API.

---

### 3. Race Condition Prevention

**Problem**: If a user types quickly (e.g. "phone"), multiple API requests fire. A slow earlier request (for "p") could resolve after a faster later one (for "phone"), replacing the correct results.

**Solution**: Each search uses a new `AbortController`. When a new search fires, the previous controller's `abort()` is called, canceling the in-flight HTTP request. Axios throws an `ERR_CANCELED` error on abort, which we detect and ignore.

**Test**: Add `&delay=2000` to the DummyJSON API URL in `product.service.ts` and type quickly — old results will never replace new ones.

---

### 4. URL State Management

All filter, sort, search, and pagination state lives in the URL query string (e.g. `?page=2&limit=20&search=laptop&sortBy=price&sortOrder=desc`). This means:
- Refreshing the page shows the exact same results
- Sharing the URL with a colleague works
- The browser back/forward buttons work correctly

Invalid URL values (e.g. `?page=abc`, `?page=9999`, `?limit=7`) are silently sanitized to sensible defaults — the page never breaks.

---

### 5. No External Table / Pagination Libraries

As required, all table, pagination, and search logic is written from scratch:
- `Pagination.tsx` — custom page range algorithm with ellipsis
- `ProductTable.tsx` — plain HTML table with Tailwind
- `useDebounce.ts` — 30-line custom hook
- `useURLParams.ts` — custom URL state manager

---

## Where AI Helped

AI (Kiro IDE) was used throughout this project for:
- Scaffolding boilerplate (component structure, type definitions)
- Catching TypeScript errors before the build ran
- Suggesting the `AbortController` pattern for race conditions
- Writing the `getPaginationRange` algorithm for the ellipsis pattern
- Accessibility attributes (`aria-live`, `role="status"`, `scope="col"`)

Every line was reviewed and understood before committing. The architecture decisions (URL state, optimistic updates, search vs category trade-off) were made independently.

---

## One Problem I Faced

**Problem**: The DummyJSON `/products/categories` endpoint changed its response format. It used to return `["beauty", "fragrances", ...]` (plain strings). It now returns `[{"slug": "beauty", "name": "Beauty", "url": "..."}]` (objects).

This caused the category dropdown to render empty options and the category filter URL to pass the whole object string instead of the slug.

**Fix**: Added a `Category` interface to `product.types.ts`, updated the service to type the response correctly, and updated `FilterSort.tsx` and `ProductForm.tsx` to use `cat.slug` as the value and `cat.name` as the display label. The fix also made the code more explicit and maintainable.

---

## Commit History

Each phase has its own commit, documenting incremental progress:

```
feat: initial project setup with Next.js, TypeScript, and Tailwind CSS
feat: configure axios instance with interceptors and add TypeScript types
feat: implement authentication system with login, logout, and protected routes
feat: add product list page with search, filter, sort, and pagination logic
feat: add SearchBar, FilterSort, Pagination and shared UI components
feat: add ProductTable (desktop) and ProductCard (mobile) with delete confirmation modal
feat: add product details page with image gallery, reviews, and not-found handling
feat: add product form with validation for add and edit modes
feat: fix categories API, strengthen race condition handling and URL validation
feat: upgrade header with mobile menu, add global 404, Button and Badge components
fix: QA fixes - retry button, delete error handling, and accessibility improvements
docs: finalize README with setup instructions and reflection note
```

---

## API Reference

Base URL: `https://dummyjson.com`

| Endpoint | Method | Used For |
|---|---|---|
| `/auth/login` | POST | Login |
| `/products` | GET | Product list with pagination |
| `/products/search?q=` | GET | Search products |
| `/products/categories` | GET | Fetch all categories |
| `/products/category/:slug` | GET | Filter by category |
| `/products/:id` | GET | Product details |
| `/products/add` | POST | Add product (simulated) |
| `/products/:id` | PUT | Edit product (simulated) |
| `/products/:id` | DELETE | Delete product (simulated) |

---

*Built for the Nexgensis Frontend Assessment.*
