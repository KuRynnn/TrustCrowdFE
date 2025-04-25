"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientSidebar from "@/components/organisms/sidebar/ClientSidebar";

export default function ClientDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not a client
    if (!loading && user && user.role !== "client") {
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
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Client Dashboard
        </h1>
        <p className="mb-4">Welcome, {user?.name}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Your Applications</h2>
            <p>Manage your UAT applications and track testing progress.</p>
            <button 
              onClick={() => router.push("/client/application")}
              className="mt-4 px-4 py-2 bg-[#4c0e8f] rounded-md"
            >
              View Applications
            </button>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Results</h2>
            <p>View test results and bug reports from crowdworkers.</p>
            <button 
              className="mt-4 px-4 py-2 bg-[#4c0e8f] rounded-md"
            >
              View Results
            </button>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
            <p>Update your profile and account settings.</p>
            <button 
              className="mt-4 px-4 py-2 bg-[#4c0e8f] rounded-md"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
