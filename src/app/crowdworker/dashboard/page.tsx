"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CrowdworkerSidebar from "@/components/organisms/sidebar/CrowdworkerSidebar";

export default function CrowdworkerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not a crowdworker
    if (!loading && user && user.role !== "crowdworker") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
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
        <h1 className="text-2xl font-semibold mb-4">
          Crowdworker Dashboard
        </h1>
        <p className="mb-4">Welcome, {user?.name}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Available Applications</h2>
            <p>Browse applications available for testing.</p>
            <button 
              onClick={() => router.push("/crowdworker/applications/available")}
              className="mt-4 px-4 py-2 bg-[#4c0e8f] rounded-md"
            >
              View Available
            </button>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">My Applications</h2>
            <p>View applications you are currently testing.</p>
            <button 
              onClick={() => router.push("/crowdworker/applications")}
              className="mt-4 px-4 py-2 bg-[#4c0e8f] rounded-md"
            >
              My Applications
            </button>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Performance</h2>
            <p>View your testing performance and statistics.</p>
            <button 
              className="mt-4 px-4 py-2 bg-[#4c0e8f] rounded-md"
            >
              View Stats
            </button>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Testing Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a2e] p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Completed Tasks</p>
              <p className="text-3xl font-bold">
                {user?.role === "crowdworker" ? (user as any).completed_tasks_count || 0 : 0}
              </p>
            </div>
            <div className="bg-[#1a1a2e] p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Bug Reports</p>
              <p className="text-3xl font-bold">
                {user?.role === "crowdworker" ? (user as any).total_bug_reports || 0 : 0}
              </p>
            </div>
            <div className="bg-[#1a1a2e] p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Skills</p>
              <p className="text-lg">
                {user?.role === "crowdworker" ? (user as any).skills || "Not specified" : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
