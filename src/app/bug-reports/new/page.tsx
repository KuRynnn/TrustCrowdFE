// ✅ File: src/app/bug-reports/new/page.tsx

import BugReportForm from "@/components/organisms/bug-report/BugReportForm";

export default function NewBugReportPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Submit New Bug Report</h1>
      <BugReportForm />
    </div>
  );
}