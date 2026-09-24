import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { validatePageNumber, validateLimit, validateSortBy, validateSortOrder } from "@/lib/utils";

export interface URLParamsState {
  page: number;
  limit: number;
  search: string;
  category: string;
  sortBy: string;
  sortOrder: string;
}

/**
 * Hook to manage URL query parameters for product list
 * Keeps state in sync with URL so refreshing or sharing the link works
 */
export function useURLParams(totalPages: number = 1) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read current values from URL
  const page = validatePageNumber(searchParams.get("page"), totalPages);
  const limit = validateLimit(searchParams.get("limit"));
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = validateSortBy(searchParams.get("sortBy"));
  const sortOrder = validateSortOrder(searchParams.get("sortOrder"));

  // Update URL with new parameters
  const updateParams = useCallback(
    (updates: Partial<URLParamsState>) => {
      const params = new URLSearchParams();

      // Merge current params with updates
      const newPage = updates.page !== undefined ? updates.page : page;
      const newLimit = updates.limit !== undefined ? updates.limit : limit;
      const newSearch = updates.search !== undefined ? updates.search : search;
      const newCategory = updates.category !== undefined ? updates.category : category;
      const newSortBy = updates.sortBy !== undefined ? updates.sortBy : sortBy;
      const newSortOrder = updates.sortOrder !== undefined ? updates.sortOrder : sortOrder;

      // Only add non-default values to URL
      if (newPage > 1) params.set("page", newPage.toString());
      if (newLimit !== 10) params.set("limit", newLimit.toString());
      if (newSearch) params.set("search", newSearch);
      if (newCategory) params.set("category", newCategory);
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder !== "asc") params.set("sortOrder", newSortOrder);

      // Update URL without reload
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/products");
    },
    [page, limit, search, category, sortBy, sortOrder, router]
  );

  return {
    params: { page, limit, search, category, sortBy, sortOrder },
    updateParams,
  };
}
