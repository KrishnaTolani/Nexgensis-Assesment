interface EmptyStateProps {
  message?: string;
  subMessage?: string;
  onClearFilters?: () => void;
}

export default function EmptyState({
  message = "No products found",
  subMessage,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
      <div className="flex justify-center mb-4">
        <svg
          className="h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <p className="text-gray-700 text-xl font-medium mb-2">{message}</p>
      {subMessage && <p className="text-gray-500 mb-4">{subMessage}</p>}
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
