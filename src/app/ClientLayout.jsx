"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import usePaddle from "@/hooks/usePaddle";

/**
 * This inner component contains the parts of the layout that need access
 * to the authentication context (like Navbar) or other client hooks (like usePaddle).
 * By placing it inside ClientLayout as a child of AuthProvider, we ensure
 * that all these components share the same, single auth state.
 */
function AppContent({ children }) {
  // Now it's safe to call usePaddle() here, because this component
  // is rendered within the AuthProvider's scope.
  usePaddle();

  return (
    <>
      <Navbar />
      {/* 
        Add padding-top to the main content area to prevent it from being
        hidden by the fixed navbar. A standard navbar height is h-16 (4rem),
        so pt-20 (5rem) gives a little extra space.
      */}
      <main className="pt-20 container mx-auto p-4">
        {children}
      </main>
    </>
  );
}


export default function ClientLayout({ children }) {
  // AuthProvider is the top-level wrapper. It provides the authentication
  // context to all of its children.
  return (
    <AuthProvider>
      <AppContent>
        {children}
      </AppContent>
    </AuthProvider>
  );
}