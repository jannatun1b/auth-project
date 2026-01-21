'use client';

import React from 'react';
import Button from './components/Button';
import AuthGuard from './components/AuthGuard';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back 👋</h1>

          {/* Subtitle */}
          <p className="text-gray-500 mb-8">You are successfully logged in</p>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6" />

          {/* Logout Button */}
          <Button />
          <Link href={'/profile'}>Profile</Link>

          {/* Footer text */}
          <p className="mt-6 text-sm text-gray-400">© 2026 Your App. All rights reserved.</p>
        </div>
      </main>
    </AuthGuard>
  );
};

export default Home;
