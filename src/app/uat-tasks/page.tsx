import Link from "next/link";
import { PlusCircle } from "lucide-react";
import UATTasksTable from "@/components/organisms/uat-tasks/UATTasksTable";

export default function UATTasksPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">UAT Tasks</h1>
          <p className="text-gray-400 mt-1">
            Manage UAT tasks for crowdsourced testing
          </p>
        </div>
        
        <Link
          href="/uat-tasks/new"
          className="px-4 py-2 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg text-white font-medium transition-colors inline-flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>New UAT Task</span>
        </Link>
      </div>
      
      <div className="bg-[#0a1e3b] p-6 rounded-xl shadow-xl">
        <UATTasksTable />
      </div>
    </div>
  );
}
