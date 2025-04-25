// Folder: src/app/client/applications/page.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { useApplicationList } from '@/hooks/UseApplications';
import ApplicationsTable from '@/components/organisms/applications/ApplicationsTable';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ClientSidebar from '@/components/organisms/sidebar/ClientSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  
  // Only set the clientId when user data is fully loaded and user is a client
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'client') {
        // Redirect non-client users to dashboard
        router.push('/dashboard');
        return;
      }
      
      if (user.role === 'client' && user.client_id) {
        setClientId(user.client_id);
      }
    } else if (!authLoading && !user) {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Only fetch applications when clientId is available
  const { applications, isLoading, error, deleteApplication, updateStatus } = useApplicationList(clientId);

  // Show loading state while auth is loading or clientId is not yet set
  if (authLoading || (user?.role === 'client' && !clientId)) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <ClientSidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Applications</h1>
            <p className="text-gray-400">Manage your submitted applications</p>
          </div>
          <Link
            href="/client/application/new"
            className="px-4 py-2 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg text-white font-medium inline-flex items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>New Application</span>
          </Link>
        </div>

        <div className="bg-[#0a1e3b] p-6 rounded-xl shadow-xl">
          <ApplicationsTable
            data={applications}
            isLoading={isLoading}
            error={error}
            onDelete={deleteApplication}
            onStatusChange={updateStatus}
            showClientColumn={false}
            hideActions={false}
          />
        </div>
      </div>
    </div>
  );
}
