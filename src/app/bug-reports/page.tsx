// ✅ File: src/app/bug-reports/page.tsx

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import BugReportsTable from "@/components/organisms/bug-report/BugReportsTable";

export default function BugReportsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bug Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track bugs submitted by crowdworkers
          </p>
        </div>

        <Link
          href="/bug-reports/new"
          className="px-4 py-2 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg text-white font-medium inline-flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>New Bug Report</span>
        </Link>
      </div>

      <div className="bg-[#0a1e3b] p-6 rounded-xl shadow-xl">
        <BugReportsTable />
      </div>
    </div>
  );
}
