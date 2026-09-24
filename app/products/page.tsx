"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import productService from "@/services/product.service";
import { Product, ProductsResponse } from "@/types/product.types";
import { useURLParams } from "@/hooks/useURLParams";
import { useDebounce } from "@/hooks/useDebounce";

function ProductsContent() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Search input state (before debounce)
  const [searchInput, setSearchInput] = useState("");

  // Debounced search value (after user stops typing)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Calculate total pages
  const totalPages = Math.ceil(total / 10); // We'll use limit from URL params below

  // URL params management
  const { params, updateParams } = useURLParams(totalPages);
  const { page, limit, search, category, sortBy, sortOrder } = params;

  // Ref to track the current request controller (for canceling requests)
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync search input with URL param on mount
  useEffect(() => {
    setSearchInput(search);
  }, []); // Only on mount

  // When debounced search changes, update URL and reset to page 1
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch, page: 1, category: "" }); // Clear category when searching
    }
  }, [debouncedSearch]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever URL params change
  useEffect(() => {
    const fetchProducts = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const skip = (page - 1) * limit;
        
        const response: ProductsResponse = await productService.getProducts({
          limit,
          skip,
          search,
          category,
        });

        // Client-side sorting (API doesn't support sorting)
        let sortedProducts = [...response.products];
        if (sortBy) {
          sortedProducts.sort((a, b) => {
            let aVal: any = a[sortBy as keyof Product];
            let bVal: any = b[sortBy as keyof Product];

            // Handle string sorting (title)
            if (typeof aVal === "string") {
              aVal = aVal.toLowerCase();
              bVal = bVal.toLowerCase();
            }

            if (sortOrder === "asc") {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
        }

        setProducts(sortedProducts);
        setTotal(response.total);
      } catch (err: any) {
        if (err.code === "ERR_CANCELED") {
          // Request was canceled — not an error
          return;
        }
        setError("Failed to load products. Please try again.");
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Cleanup: abort request when component unmounts or params change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, limit, search, category, sortBy, sortOrder]);

  // Handler: change page
  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  // Handler: change limit
  const handleLimitChange = (newLimit: number) => {
    updateParams({ limit: newLimit, page: 1 }); // Reset to page 1
  };

  // Handler: change category
  const handleCategoryChange = (newCategory: string) => {
    updateParams({ category: newCategory, page: 1, search: "" }); // Clear search when filtering
    setSearchInput(""); // Clear search input field
  };

  // Handler: change sort
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    updateParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
  };

  // Handler: clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    updateParams({ search: "", category: "", sortBy: "", sortOrder: "asc", page: 1 });
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter & Sort */}
          <div className="flex flex-wrap gap-4">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!!search} // Disable when searching
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy ? `${sortBy}-${sortOrder}` : ""}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                handleSortChange(newSortBy || "", newSortOrder || "asc");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>

            {(search || category || sortBy) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Info message when search clears category */}
          {search && (
            <p className="text-sm text-blue-600">
              Category filter is cleared when searching.
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No products found</p>
            {(search || category) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Product List - Placeholder */}
        {!isLoading && !error && products.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Showing {products.length} of {total} products (Page {page} of {totalPages})
            </p>
            
            {/* Temporary product display */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">
                Product table and cards will be implemented in Phase 5-6.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Current filters: limit={limit}, page={page}, search={search || "none"}, category={category || "none"}
              </p>
            </div>

            {/* Pagination - Placeholder */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
