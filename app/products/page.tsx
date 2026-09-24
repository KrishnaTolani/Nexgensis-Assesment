"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SearchBar from "@/components/products/SearchBar";
import FilterSort from "@/components/products/FilterSort";
import Pagination from "@/components/products/Pagination";
import Loader from "@/components/ui/Loader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import productService from "@/services/product.service";
import { Product, ProductsResponse } from "@/types/product.types";
import { useURLParams } from "@/hooks/useURLParams";
import { useDebounce } from "@/hooks/useDebounce";

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  const { params, updateParams } = useURLParams(1); // initial totalPages=1, recalculated below
  const { page, limit, search, category, sortBy, sortOrder } = params;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync input with URL on mount only
  useEffect(() => {
    setSearchInput(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When debounced search changes, update URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch, page: 1, category: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch categories once
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products on param change
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const skip = (page - 1) * limit;
        const response: ProductsResponse = await productService.getProducts({
          limit,
          skip,
          search,
          category,
        });

        // Client-side sort
        let sorted = [...response.products];
        if (sortBy) {
          sorted.sort((a, b) => {
            let aVal: any = a[sortBy as keyof Product];
            let bVal: any = b[sortBy as keyof Product];
            if (typeof aVal === "string") {
              aVal = aVal.toLowerCase();
              bVal = (bVal as string).toLowerCase();
            }
            if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
          });
        }

        setProducts(sorted);
        setTotal(response.total);
      } catch (err: any) {
        if (err.code === "ERR_CANCELED") return;
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [page, limit, search, category, sortBy, sortOrder]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryChange = (value: string) => {
    setSearchInput("");
    updateParams({ category: value, search: "", page: 1 });
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    updateParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    updateParams({ search: "", category: "", sortBy: "", sortOrder: "asc", page: 1 });
  };

  const handleRetry = () => {
    updateParams({ page });
  };

  const skip = (page - 1) * limit;
  const hasActiveFilters = !!(search || category || sortBy);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <a
            href="/products/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </a>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            isLoading={isLoading && !!searchInput}
          />
          <FilterSort
            categories={categories}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            isSearchActive={!!search}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Loading */}
        {isLoading && <Loader className="py-12" />}

        {/* Error */}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {/* Empty */}
        {!isLoading && !error && products.length === 0 && (
          <EmptyState
            message="No products found"
            subMessage={hasActiveFilters ? "Try adjusting your search or filters" : undefined}
            onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
          />
        )}

        {/* Product List placeholder */}
        {!isLoading && !error && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Placeholder – table/cards come in Phase 6 */}
            <div className="p-6 space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg"
                >
                  <img src={p.thumbnail} alt={p.title} className="h-12 w-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.category}</p>
                  </div>
                  <p className="font-semibold text-gray-900">${p.price}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={limit}
              total={total}
              skip={skip}
              onPageChange={(p) => updateParams({ page: p })}
              onPageSizeChange={(s) => updateParams({ limit: s, page: 1 })}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
