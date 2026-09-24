import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: {
    default: "Product Admin Dashboard",
    template: "%s | Product Admin",
  },
  description: "Manage products with the DummyJSON API",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {/* Sticky header */}
          <Header />
          {/* Page content */}
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
