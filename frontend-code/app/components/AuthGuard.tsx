'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLogInUserQuery } from '../features/auth/authApi';

type Props = {
  children: React.ReactNode;
};

const AuthGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useLogInUserQuery(undefined);

  useEffect(() => {
    if (!isLoading) {
      if (isError || !data?.success) {
        // User not authenticated, redirect to login
        router.replace('/login');
      }
    }
  }, [isLoading, isError, data, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError || !data?.success) {
    return null; // বা loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
