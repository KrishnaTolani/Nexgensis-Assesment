"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loader while checking auth state from localStorage
  if (isLoading) {
    return <Loader size="lg" className="min-h-screen" aria-label="Checking authentication..." />;
  }

  // Not authenticated — return null while redirect happens
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
