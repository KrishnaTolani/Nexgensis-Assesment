import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with $ sign
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// Format rating to one decimal place
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Validate and sanitize URL parameters
export function validatePageNumber(value: string | null, totalPages: number): number {
  if (!value) return 1;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  if (parsed > totalPages) return totalPages || 1;
  return parsed;
}

export function validateLimit(value: string | null): number {
  if (!value) return 10;
  const parsed = parseInt(value, 10);
  const validLimits = [10, 20, 50];
  if (validLimits.includes(parsed)) return parsed;
  return 10; // default
}

export function validateSortBy(value: string | null): string {
  const valid = ["price", "rating", "title"];
  if (value && valid.includes(value)) return value;
  return ""; // no sort by default
}

export function validateSortOrder(value: string | null): string {
  if (value === "asc" || value === "desc") return value;
  return "asc"; // default
}

// Calculate pagination info
export function getPaginationInfo(total: number, skip: number, limit: number) {
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + limit, total);
  return { from, to, total };
}

// Generate an array of page numbers with ellipsis
export function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 2; // how many pages to show before/after current page
  const range: (number | string)[] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // always show first page
      i === totalPages || // always show last page
      (i >= currentPage - delta && i <= currentPage + delta) // show pages near current
    ) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  
  return range;
}

// Truncate text to a maximum length
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Check if code is running on client side
export function isClient(): boolean {
  return typeof window !== "undefined";
}
