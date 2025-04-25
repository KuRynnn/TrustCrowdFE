// src/app/crowdworker/applications/page.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { uatTaskService } from '@/services/UatTaskService';
import { Application } from '@/types/Application';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CrowdworkerSidebar from '@/components/organisms/sidebar/CrowdworkerSidebar';

// Define a type that matches what's coming back from the API
interface PartialApplication {
  app_id: string;
  app_name: string;
  app_url: string;
  platform?: string; 
  description?: string;
  status?: string;
  created_at?: string;
  client?: {
    name: string;
    company?: string;
  };
}

// Interface for application progress tracking
interface AppProgressMap {
  [key: string]: {
    total: number;
    completed: number;
    inProgress: number;
  }
}

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<PartialApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | undefined>(undefined);
  const [appProgress, setAppProgress] = useState<AppProgressMap>({});

  // Only set the workerId when user data is fully loaded and user is a crowdworker
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'crowdworker') {
        // Redirect non-crowdworker users to dashboard
        router.push('/dashboard');
        return;
      }
      
      if (user.role === 'crowdworker' && user.worker_id) {
        setWorkerId(user.worker_id);
      }
    } else if (!authLoading && !user) {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!workerId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const tasks = await uatTaskService.getTasksByCrowdworker(workerId);
        
        // Extract unique applications from tasks
        const appMap = new Map<string, PartialApplication>();
        const progressMap: AppProgressMap = {};
        
        tasks.forEach(task => {
          if (task.application && task.application.app_id) {
            // Cast to PartialApplication which matches the structure
            const appData = task.application as PartialApplication;
            appMap.set(appData.app_id, appData);
            
            // Track progress for each application
            if (!progressMap[appData.app_id]) {
              progressMap[appData.app_id] = {
                total: 0,
                completed: 0,
                inProgress: 0
              };
            }
            
            progressMap[appData.app_id].total++;
            
            if (task.status === 'Completed') {
              progressMap[appData.app_id].completed++;
            } else if (task.status === 'In Progress') {
              progressMap[appData.app_id].inProgress++;
            }
          }
        });
        
        const uniqueApps = Array.from(appMap.values());
        setApplications(uniqueApps);
        setAppProgress(progressMap);
      } catch (err: any) {
        console.error("Failed to load tasks:", err);
        setError(err.message || 'Failed to load your applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (workerId) {
      fetchMyApplications();
    }
  }, [workerId]);

  // Show loading state while auth is loading or workerId is not yet set
  if (authLoading || (user?.role === 'crowdworker' && !workerId) || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0e0b1e]">
        <div className="w-64">
          <CrowdworkerSidebar />
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
        <CrowdworkerSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Testing Applications</h1>
            <p className="text-gray-400">Applications you are currently testing</p>
          </div>
          <Link
            href="/crowdworker/applications/available"
            className="px-4 py-2 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg text-white font-medium inline-flex items-center gap-2"
          >
            <span>Find More Applications</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {!error && applications.length === 0 ? (
          <div className="bg-[#001333] p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-semibold text-white mb-4">You haven't taken any testing tasks yet</h2>
            <p className="text-gray-400 mb-6">Get started by checking out available applications to test.</p>
            <Link
              href="/crowdworker/applications/available"
              className="px-6 py-3 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] font-medium"
            >
              Browse Available Applications
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.app_id}
                className="bg-[#001333] p-6 rounded-xl shadow-xl flex flex-col"
              >
                <div className="flex-1">
                  <h2 className="text-white font-semibold text-xl mb-2">{app.app_name}</h2>
                  
                  {/* Progress Bar */}
                  {appProgress[app.app_id] && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">Testing Progress</span>
                        <span className="text-xs text-gray-400">
                          {appProgress[app.app_id].completed}/{appProgress[app.app_id].total} Tests
                        </span>
                      </div>
                      <div className="w-full bg-[#0a1e3b] rounded-full h-2">
                        <div 
                          className="bg-[#5460ff] h-2 rounded-full" 
                          style={{ 
                            width: appProgress[app.app_id].total 
                              ? `${(appProgress[app.app_id].completed / appProgress[app.app_id].total) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {app.status && (
                    <div className="mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        app.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        app.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  {app.platform && (
                    <p className="text-sm text-gray-400 mb-1">Platform: {app.platform}</p>
                  )}
                  
                  {app.client && (
                    <p className="text-sm text-gray-400 mb-3">Client: {app.client.name}</p>
                  )}
                  
                  {app.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                      {app.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/crowdworker/applications/${app.app_id}`}
                    className="flex-1 text-center px-3 py-2 bg-[#0a1e3b] text-white rounded-md hover:bg-[#0a1e3b]/70 font-medium text-sm"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/crowdworker/applications/${app.app_id}/tasks`}
                    className="flex-1 text-center px-3 py-2 bg-[#5460ff] text-white rounded-md hover:bg-[#4450dd] font-medium text-sm"
                  >
                    Continue Testing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}