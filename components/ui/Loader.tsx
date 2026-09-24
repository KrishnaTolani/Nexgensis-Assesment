interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

export default function Loader({
  size = "md",
  className = "",
  "aria-label": ariaLabel = "Loading...",
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
        aria-label={ariaLabel}
      ></div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
