// src/app/client/applications/new/page.tsx
"use client";

import ApplicationForm from '@/components/organisms/applications/ApplicationForm';
import ClientSidebar from '@/components/organisms/sidebar/ClientSidebar';

export default function ClientNewApplicationPage() {
  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Application</h1>
        <ApplicationForm />
      </div>
    </div>
  );
}
