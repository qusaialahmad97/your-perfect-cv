"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import usePaddle from "@/hooks/usePaddle"; // Assuming you have this for Paddle.js
import { usePathname } from 'next/navigation'; // Import usePathname

export default function ClientLayout({ children }) {
  usePaddle(); // Initialize Paddle on the client side
  const pathname = usePathname();

  // --- THE FIX ---
  // Define which routes should be full-width.
  const fullWidthRoutes = ['/contact', '/another-full-width-page', '/pricing', '/build', '/'];

  // Check if the current page is one of the full-width routes.
  const isFullWidth = fullWidthRoutes.includes(pathname);

  return (
    <AuthProvider>
      <Navbar />
      {/* 
        Conditionally apply the container class.
        If the page is in our fullWidthRoutes array, we use a simple div.
        Otherwise, we wrap the content in our standard centered container.
      */}
      {isFullWidth ? (
        <main className="pt-16"> {/* Basic padding to avoid navbar overlap */}
          {children}
        </main>
      ) : (
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      )}
      {/* You can add a Footer component here if it's also a client component */}
    </AuthProvider>
  );
}