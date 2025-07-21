"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProtectedRoute = (path) => {
    if (!loading) {
      if (user) {
        router.push(path);
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Your Perfect CV
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => handleProtectedRoute('/pricing')}
                className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => handleProtectedRoute('/ats-checker')}
                className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                ATS Checker
              </button>
              
              {/* --- ADDITION: Added Contact Link Here --- */}
              <Link href="/contact" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </Link>
              {/* --- END OF ADDITION --- */}

              <Link href="/terms-of-service" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Terms
              </Link>
              <Link href="/privacy-policy" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Privacy
              </Link>
              
              {!loading && (
                user ? (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-bold">
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-bold">
                      Login
                    </Link>
                    <Link href="/register" className="bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium">
                      Register
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;