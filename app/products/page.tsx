"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SearchBar from "@/components/products/SearchBar";
import FilterSort from "@/components/products/FilterSort";
import Pagination from "@/components/products/Pagination";
import ProductTable from "@/components/products/ProductTable";
import ProductCard from "@/components/products/ProductCard";
import Loader from "@/components/ui/Loader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import productService from "@/services/product.service";
import { Product, ProductsResponse, Category } from "@/types/product.types";
import { useURLParams } from "@/hooks/useURLParams";
import { useDebounce } from "@/hooks/useDebounce";

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  const { params, updateParams } = useURLParams();
  const { page, limit, search, category, sortBy, sortOrder } = params;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const skip = (page - 1) * limit;

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync search input with URL on mount only
  useEffect(() => {
    setSearchInput(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When debounced search changes update URL — reset to page 1 and clear category
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch, page: 1, category: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch categories once on mount
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products whenever URL params change
  useEffect(() => {
    // Cancel any in-flight request (race condition prevention)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const response: ProductsResponse = await productService.getProducts({
          limit,
          skip,
          search,
          category,
          signal: abortControllerRef.current?.signal,
        });

        // Client-side sort (API doesn't support sorting natively)
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

        // Clamp out-of-range page numbers AFTER we know the real total
        // e.g. ?page=999 with only 20 pages → redirect to last page
        const realTotalPages = Math.max(1, Math.ceil(response.total / limit));
        if (page > realTotalPages) {
          updateParams({ page: realTotalPages });
        }
      } catch (err: any) {
        if (err.code === "ERR_CANCELED") return; // Aborted — not a real error
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

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => setSearchInput(value);

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

  const handleRetry = () => updateParams({ page });

  // Open delete confirmation modal
  const handleDeleteClick = (product: Product) => setDeleteTarget(product);

  // Cancel delete
  const handleDeleteCancel = () => {
    if (!isDeleting) setDeleteTarget(null);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await productService.deleteProduct(deleteTarget.id);
      // Optimistic update: remove from local state immediately
      // (API doesn't really persist the delete, but we show it in the UI)
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setIsDeleting(false);
    }
  };

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
          <Link
            href="/products/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
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

        {/* Product List */}
        {!isLoading && !error && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop: Table */}
            <ProductTable products={products} onDelete={handleDeleteClick} />

            {/* Mobile: Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-4">
                  <ProductCard product={product} onDelete={handleDeleteClick} />
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteTarget}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDestructive={true}
          isLoading={isDeleting}
        />
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
