"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Loader from "@/components/ui/Loader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import productService from "@/services/product.service";
import { Product } from "@/types/product.types";
import { formatPrice, formatRating } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image gallery state
  const [selectedImage, setSelectedImage] = useState<string>("");

  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);

    // Validate id — must be a positive integer
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId < 1) {
      notFound(); // triggers not-found.tsx
      return;
    }

    try {
      const data = await productService.getProductById(numId);
      setProduct(data);
      setSelectedImage(data.thumbnail);
    } catch (err: any) {
      if (err.response?.status === 404) {
        notFound(); // triggers not-found.tsx
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

  // Render star rating visually
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>

        {/* Loading */}
        {isLoading && <Loader className="py-20" />}

        {/* Error */}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={fetchProduct} />
        )}

        {/* Product Detail */}
        {!isLoading && !error && product && (
          <div className="space-y-8">
            {/* Top Section: Images + Info */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* ── Image Gallery ── */}
                <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                  {/* Main Image */}
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedImage}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Thumbnail Strip */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {product.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === img
                              ? "border-blue-500"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.title} view ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Product Info ── */}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    {/* Category Badge */}
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize mb-3">
                      {product.category}
                    </span>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.title}</h1>

                    {/* Brand */}
                    {product.brand && (
                      <p className="text-sm text-gray-500 mb-3">by {product.brand}</p>
                    )}

                    {/* Rating row */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatRating(product.rating)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({product.reviews?.length ?? 0} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {product.discountPercentage.toFixed(0)}% off
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Stock</p>
                        <p className={`text-sm font-semibold ${
                          product.stock === 0 ? "text-red-600"
                          : product.stock < 10 ? "text-yellow-600"
                          : "text-green-600"
                        }`}>
                          {product.stock === 0 ? "Out of stock" : `${product.stock} units`}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">SKU</p>
                        <p className="text-sm font-semibold text-gray-900">{product.sku}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Weight</p>
                        <p className="text-sm font-semibold text-gray-900">{product.weight}g</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Min Order</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {product.minimumOrderQuantity} units
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/products/edit/${product.id}`}
                      className="flex-1 py-2.5 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Product
                    </Link>
                    <Link
                      href="/products"
                      className="flex-1 py-2.5 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      All Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Policy Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Shipping</p>
                <p className="text-sm text-gray-700">{product.shippingInformation}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Warranty</p>
                <p className="text-sm text-gray-700">{product.warrantyInformation}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Return Policy</p>
                <p className="text-sm text-gray-700">{product.returnPolicy}</p>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Reviews ({product.reviews.length})
                </h2>
                <div className="space-y-4">
                  {product.reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                    >
                      {/* Reviewer header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {review.reviewerName}
                          </p>
                          <p className="text-xs text-gray-500">{review.reviewerEmail}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      {/* Comment */}
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
