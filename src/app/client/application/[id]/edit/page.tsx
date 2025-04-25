// src/app/client/applications/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useApplicationDetail } from '@/hooks/UseApplications';
import ApplicationForm from '@/components/organisms/applications/ApplicationForm';
import ClientSidebar from '@/components/organisms/sidebar/ClientSidebar';

export default function ClientEditApplicationPage() {
  const { id } = useParams();
  const { application, isLoading, error } = useApplicationDetail(id as string);

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="p-8 text-center text-white">Loading application...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading application: {error.message}
          </div>
        ) : !application ? (
          <div className="p-8 text-center text-white">Application not found</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-6">
              Edit Application: {application.app_name}
            </h1>
            <ApplicationForm initialData={application} isEditing={true} />
          </>
        )}
      </div>
    </div>
  );
}
