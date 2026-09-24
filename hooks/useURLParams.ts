import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { validateLimit, validateSortBy, validateSortOrder } from "@/lib/utils";

export interface URLParamsState {
  page: number;
  limit: number;
  search: string;
  category: string;
  sortBy: string;
  sortOrder: string;
}

/**
 * Hook to read and write URL query parameters for the product list page.
 * All page state lives in the URL so refreshing or sharing the link
 * shows exactly the same result.
 *
 * Edge cases handled:
 * - ?page=abc   → treated as page 1
 * - ?page=0     → treated as page 1
 * - ?page=9999  → capped to totalPages after data loads (handled by caller)
 * - ?limit=7    → defaults to 10 (only 10/20/50 allowed)
 * - ?sortBy=xyz → ignored (only price/rating/title allowed)
 */
export function useURLParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Read & validate current URL params ────────────────────────────────────
  const rawPage = searchParams.get("page");
  const parsedPage = parseInt(rawPage ?? "1", 10);
  // Invalid string (NaN) or < 1 → default to 1
  // Out-of-range (e.g. ?page=9999) will be silently clamped by the page
  // component after it knows the total, without breaking anything
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const limit = validateLimit(searchParams.get("limit"));
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = validateSortBy(searchParams.get("sortBy"));
  const sortOrder = validateSortOrder(searchParams.get("sortOrder"));

  // ── Write new params to URL ────────────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Partial<URLParamsState>) => {
      const newPage = updates.page !== undefined ? updates.page : page;
      const newLimit = updates.limit !== undefined ? updates.limit : limit;
      const newSearch = updates.search !== undefined ? updates.search : search;
      const newCategory = updates.category !== undefined ? updates.category : category;
      const newSortBy = updates.sortBy !== undefined ? updates.sortBy : sortBy;
      const newSortOrder = updates.sortOrder !== undefined ? updates.sortOrder : sortOrder;

      const params = new URLSearchParams();

      // Only include non-default values to keep URL clean
      if (newPage > 1) params.set("page", String(newPage));
      if (newLimit !== 10) params.set("limit", String(newLimit));
      if (newSearch) params.set("search", newSearch);
      if (newCategory) params.set("category", newCategory);
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder !== "asc") params.set("sortOrder", newSortOrder);

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [page, limit, search, category, sortBy, sortOrder, router, pathname]
  );

  return {
    params: { page, limit, search, category, sortBy, sortOrder },
    updateParams,
  };
}
