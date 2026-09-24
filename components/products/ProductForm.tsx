"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductFormData } from "@/types/product.types";
import productService from "@/services/product.service";

interface ProductFormProps {
  mode: "add" | "edit";
  productId?: number;
  initialData?: ProductFormData;
  // Called after successful save so parent can do optimistic update
  onSuccess?: (data: ProductFormData & { id?: number }) => void;
}

const EMPTY_FORM: ProductFormData = {
  title: "",
  description: "",
  price: 0,
  category: "",
  brand: "",
  stock: 0,
  thumbnail: "",
};

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
  thumbnail?: string;
}

export default function ProductForm({ mode, productId, initialData, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialData || EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories for the dropdown
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Sync form when initialData loads (for edit mode)
  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!form.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (form.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    } else if (form.price > 100000) {
      newErrors.price = "Price seems too high (max $100,000)";
    }

    if (form.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    } else if (!Number.isInteger(form.stock)) {
      newErrors.stock = "Stock must be a whole number";
    }

    if (form.thumbnail && !/^https?:\/\/.+/.test(form.thumbnail)) {
      newErrors.thumbnail = "Thumbnail must be a valid URL (starting with http/https)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Field change handler ─────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;
    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        const result = await productService.addProduct(form);
        // API returns the new product with a fake id
        onSuccess?.({ ...form, id: result.id });
        router.push("/products");
      } else if (mode === "edit" && productId) {
        await productService.updateProduct(productId, form);
        // Optimistic update: API doesn't really persist but we treat it as success
        onSuccess?.({ ...form, id: productId });
        router.push(`/products/${productId}`);
      }
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || "Failed to save product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reusable field wrapper ───────────────────────────────────────────────
  const Field = ({
    label,
    name,
    required = false,
    children,
  }: {
    label: string;
    name: keyof FormErrors;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {errors[name] && (
        <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* API Note Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> The DummyJSON API simulates {mode === "add" ? "adding" : "updating"} but does not persist data. Changes will appear in the UI immediately but will be lost on refresh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <Field label="Product Title" name="title" required>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Pro"
              className={inputClass("title")}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Field label="Description" name="description" required>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              rows={4}
              className={inputClass("description")}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        {/* Price */}
        <Field label="Price ($)" name="price" required>
          <input
            type="number"
            name="price"
            value={form.price || ""}
            onChange={handleChange}
            placeholder="0.00"
            min={0}
            step={0.01}
            className={inputClass("price")}
            disabled={isSubmitting}
          />
        </Field>

        {/* Stock */}
        <Field label="Stock Quantity" name="stock" required>
          <input
            type="number"
            name="stock"
            value={form.stock || ""}
            onChange={handleChange}
            placeholder="0"
            min={0}
            step={1}
            className={inputClass("stock")}
            disabled={isSubmitting}
          />
        </Field>

        {/* Category */}
        <Field label="Category" name="category" required>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass("category")}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </Field>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="e.g. Apple"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Thumbnail URL */}
        <div className="md:col-span-2">
          <Field label="Thumbnail URL" name="thumbnail">
            <input
              type="url"
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass("thumbnail")}
              disabled={isSubmitting}
            />
          </Field>
          {/* Thumbnail Preview */}
          {form.thumbnail && !errors.thumbnail && (
            <div className="mt-2">
              <img
                src={form.thumbnail}
                alt="Thumbnail preview"
                className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none sm:px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            mode === "add" ? "Add Product" : "Save Changes"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none sm:px-8 py-2.5 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
