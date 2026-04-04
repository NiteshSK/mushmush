"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/Admin/AdminLayout';
import AuthSessionProvider from '@/components/Providers/SessionProvider';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

const AdminAuthWrapperContent: React.FC<AdminAuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    setDebugInfo(`Status: ${status}, Session: ${!!session}, Role: ${session?.user?.role || 'none'}`);

    if (status === 'loading') {
      return;
    }

    if (!session) {
      setTimeout(() => {
        router.push('/auth/signin?callbackUrl=/admin');
      }, 2000);
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      setTimeout(() => {
        router.push('/');
      }, 3000);
      return;
    }

    setIsAuthorized(true);
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-1">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-6">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-1">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-dark mb-4">Access Denied</h1>
          <p className="text-gray-6">You don't have permission to access this area.</p>
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-sm text-gray-700">Debug Info: {debugInfo}</p>
            <p className="text-xs text-gray-500 mt-2">Check browser console for more details</p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  return (
    <AuthSessionProvider>
      <AdminAuthWrapperContent>{children}</AdminAuthWrapperContent>
    </AuthSessionProvider>
  );
}
