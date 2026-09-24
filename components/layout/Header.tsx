"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link href="/products" className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Product Admin</h1>
          </Link>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.image}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-500 text-xs">@{user.username}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
