// src/app/crowdworker/applications/available/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { applicationService } from '@/services/ApplicationService';
import { Application } from '@/types/Application';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';

export default function AvailableApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const fetchAvailableApplications = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is a crowdworker and has worker_id
      if (!user || user.role !== 'crowdworker') {
        setError(new Error('You must be logged in as a crowdworker to view available applications'));
        setIsLoading(false);
        return;
      }
      
      const data = await applicationService.getAvailableForCrowdworker(user.worker_id);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'crowdworker') {
        router.push('/dashboard');
        return;
      }
      fetchAvailableApplications();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
        </div>
        
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <CrowdworkerSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Available Applications</h1>
          <p className="text-gray-400">Choose an application to start testing</p>
        </div>

        {applications.length === 0 ? (
          <p className="text-gray-400">No available applications found.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.app_id}
                className="p-4 bg-[#1a1a2e] rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-white font-semibold text-lg">{app.app_name}</h2>
                  <p className="text-sm text-gray-400">{app.platform}</p>
                  {app.client && <p className="text-xs text-gray-500">Client: {app.client.name}</p>}
                </div>
                <Link
                  href={`/crowdworker/applications/${app.app_id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}