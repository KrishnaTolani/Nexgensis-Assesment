"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProductForm from "@/components/products/ProductForm";
import Loader from "@/components/ui/Loader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import productService from "@/services/product.service";
import { ProductFormData } from "@/types/product.types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  const [initialData, setInitialData] = useState<ProductFormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const numId = parseInt(id, 10);

  const fetchProduct = async () => {
    // Validate id
    if (isNaN(numId) || numId < 1) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const product = await productService.getProductById(numId);
      // Map full product to the form fields we support
      setInitialData({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand || "",
        stock: product.stock,
        thumbnail: product.thumbnail,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError("Failed to load product. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {!isLoading && !notFound && (
            <>
              <Link
                href={`/products/${numId}`}
                className="hover:text-blue-600 transition-colors"
              >
                Product #{numId}
              </Link>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
          <span className="text-gray-900 font-medium">Edit</span>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update the product details below</p>
        </div>

        {/* Loading */}
        {isLoading && <Loader className="py-20" />}

        {/* Not Found */}
        {notFound && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</p>
            <p className="text-gray-600 mb-6">
              The product with ID "{id}" does not exist.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Products
            </Link>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={fetchProduct} />
        )}

        {/* Form (only renders when data is loaded) */}
        {!isLoading && !error && !notFound && initialData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ProductForm
              mode="edit"
              productId={numId}
              initialData={initialData}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
