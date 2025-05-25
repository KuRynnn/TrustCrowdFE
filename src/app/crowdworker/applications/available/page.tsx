// src/app/crowdworker/applications/available/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { applicationService } from '@/services/ApplicationService';
import { Application } from '@/types/Application';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';
import { Users, FileText, AlertCircle } from 'lucide-react';

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
          <div className="mt-2 bg-blue-500/20 text-blue-300 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="text-sm">You can test up to 2 applications simultaneously</span>
          </div>
        </div>
        
        {applications.length === 0 ? (
          <div className="bg-[#001333] p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-semibold text-white mb-2">No Available Applications</h2>
            <p className="text-gray-400 mb-4">
              Either you've reached your maximum of 2 active applications, or there are no applications available for testing at the moment.
            </p>
            <Link
              href="/crowdworker/applications"
              className="px-6 py-3 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] font-medium inline-block"
            >
              View My Applications
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.app_id}
                className="p-4 bg-[#001333] rounded-lg shadow-xl hover:bg-[#001333]/80 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-white font-semibold text-lg mb-1">{app.app_name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-500">Platform:</span> {app.platform}
                      </span>
                      {app.test_cases_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {app.test_cases_count} test cases
                        </span>
                      )}
                      {app.current_workers !== undefined && app.max_testers !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {app.current_workers}/{app.max_testers} testers
                        </span>
                      )}
                    </div>
                    {app.client && (
                      <p className="text-xs text-gray-500">Client: {app.client.name}</p>
                    )}
                    {app.description && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{app.description}</p>
                    )}
                  </div>
                  <Link
                    href={`/crowdworker/applications/${app.app_id}`}
                    className="ml-4 px-4 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] text-sm font-medium whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}