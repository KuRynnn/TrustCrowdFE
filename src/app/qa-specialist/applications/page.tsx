// src/app/qa-specialist/applications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/ApplicationService";
import { Application } from "@/types/Application";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import QASpecialistSidebar from "@/components/organisms/sidebar/QASpecialistSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function QAApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apps = await applicationService.getAllApplications();
        setApplications(apps);
      } catch (err) {
        console.error(err);
        setError("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      if (user.role !== 'qa_specialist') {
        router.push('/dashboard');
        return;
      }
      fetchData();
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
        {/* Sidebar */}
        <div className="w-64">
          <QASpecialistSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <h1 className="text-2xl font-bold text-white mb-6">All Applications</h1>
        {applications.length === 0 ? (
          <p className="text-gray-400">No applications found.</p>
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
                </div>
                <Link
                  href={`/qa-specialist/applications/${app.app_id}`}
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