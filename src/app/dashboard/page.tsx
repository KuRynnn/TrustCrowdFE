// ✅ File: src/app/dashboard/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientSidebar from "@/components/organisms/sidebar/ClientSidebar";
import CrowdworkerSidebar from "@/components/organisms/sidebar/CrowdworkerSidebar";
import QASpecialistSidebar from "@/components/organisms/sidebar/QASpecialistSidebar";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and both user and token are missing
    if (!loading && !user && !token) {
      router.push("/login");
      return;
    }
    
    // Redirect to role-specific dashboard if user is authenticated
    if (!loading && user) {
      switch (user.role) {
        case "client":
          router.push("/client/dashboard");
          break;
        case "crowdworker":
          router.push("/crowdworker/dashboard");
          break;
        case "qa_specialist":
          router.push("/qa-specialist/dashboard");
          break;
        default:
          // Keep on the generic dashboard if role is unknown
          break;
      }
    }
  }, [user, token, loading, router]);

  // Show loading state if still loading or if we have a token but no user yet
  if (loading || (!user && token)) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user and no token, show an error
  if (!user && !token) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-500 mb-4">Authentication error</p>
          <button 
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-[#4c0e8f] rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    console.log("Rendering sidebar for role:", user?.role);
    console.log("Full user object:", user);
    
    switch (user?.role) {
      case "client":
        return <ClientSidebar />;
      case "crowdworker":
        return <CrowdworkerSidebar />;
      case "qa_specialist":
        return <QASpecialistSidebar />;
      default:
        console.warn("Unknown or missing role, cannot render specific sidebar");
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        {renderSidebar()}
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome, {user?.name || 'User'}
        </h1>
        <p className="mb-2">Role: {user?.role || 'Unknown'}</p>

        {user?.role === "client" && (
          <p>You can manage your applications and track testing progress here.</p>
        )}

        {user?.role === "crowdworker" && (
          <p>You can view assigned tasks and submit bug reports.</p>
        )}

        {user?.role === "qa_specialist" && (
          <p>You can validate bug reports and manage test cases.</p>
        )}
      </div>
    </div>
  );
}
