'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogInUserQuery } from '../features/auth/authApi';

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useLogInUserQuery(undefined);

  useEffect(() => {
    if (!isLoading && data?.success) {
      // User already logged in, redirect to home
      router.replace('/');
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default Layout;
