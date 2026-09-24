import Link from "next/link";
import { Product } from "@/types/product.types";
import { formatPrice, formatRating } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onDelete: (product: Product) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    // Visible on mobile, hidden on desktop
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Category */}
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 block"
          >
            {product.title}
          </Link>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {product.category}
          </span>

          {/* Price & Rating Row */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-base font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="ml-1 text-xs text-green-600">
                  -{product.discountPercentage.toFixed(0)}%
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-700">{formatRating(product.rating)}</span>
            </div>
          </div>

          {/* Stock */}
          <p className="text-xs mt-1">
            Stock:{" "}
            <span
              className={`font-medium ${
                product.stock === 0
                  ? "text-red-600"
                  : product.stock < 10
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {product.stock === 0 ? "Out of stock" : product.stock}
            </span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 py-1.5 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          View
        </Link>
        <Link
          href={`/products/edit/${product.id}`}
          className="flex-1 py-1.5 text-center text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(product)}
          className="flex-1 py-1.5 text-center text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
