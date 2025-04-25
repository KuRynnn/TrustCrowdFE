import Link from "next/link";
import { PlusCircle } from "lucide-react";
import BugValidationsTable from "@/components/organisms/bug-validation/BugValidationsTable";

export default function BugValidationsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Bug Validations</h1>
          <p className="text-gray-400 mt-1">
            Validate and manage bug reports for UAT crowdsourcing
          </p>
        </div>
        
        <Link
          href="/bug-validations/new"
          className="px-4 py-2 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg text-white font-medium transition-colors inline-flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>New Validation</span>
        </Link>
      </div>
      
      <div className="bg-[#0a1e3b] p-6 rounded-xl shadow-xl">
        <BugValidationsTable />
      </div>
    </div>
  );
}
