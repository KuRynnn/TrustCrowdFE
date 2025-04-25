// ✅ File: src/app/bug-reports/[id]/edit/page.tsx

"use client";

import { useParams } from "next/navigation";
import BugReportForm from "@/components/organisms/bug-report/BugReportForm";
import { useBugReportDetail } from "@/hooks/UseBugReports";

export default function EditBugReportPage() {
  const { id } = useParams();
  const { report, isLoading, error } = useBugReportDetail(id as string);

  if (isLoading) return <div className="p-8 text-center">Loading bug report...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  if (!report) return <div className="p-8 text-center">Bug report not found.</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Bug Report</h1>
      <BugReportForm initialData={report} isEditing />
    </div>
  );
}
