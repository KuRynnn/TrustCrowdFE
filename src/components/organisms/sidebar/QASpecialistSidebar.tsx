// src/components/organisms/sidebar/QASpecialistSidebar.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Users, LogOut, ClipboardList, ListChecks, CheckSquare, ClipboardCheck, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function QASpecialistSidebar() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState("/qa-specialist/dashboard");
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  
  // Update active path when pathname changes
  useEffect(() => {
    if (pathname) {
      setActivePath(pathname);
    }
  }, [pathname]);
  
  const handleNavigate = (path: string) => {
    setActivePath(path);
  };
  
  const handleLogout = () => {
    setLoggingOut(true);
    // Call the actual logout function
    logout();
  };
  
  const isActive = (path: string) => activePath.includes(path);
  
  return (
    <aside className="bg-[#001333] h-screen text-white col-span-2 flex flex-col justify-between shadow-xl overflow-y-auto fixed w-64">
      <div>
        <h2 className="text-2xl text-center font-bold mb-6 text-gray-200 p-4 mt-4">
          QA Specialist Panel
        </h2>
        <nav className="p-2">
          <ul className="space-y-2">
            {/* Dashboard */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/qa-specialist/dashboard")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/qa-specialist/dashboard"
                onClick={() => handleNavigate("/qa-specialist/dashboard")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <Users size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            
            {/* Applications */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/qa-specialist/applications")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/qa-specialist/applications"
                onClick={() => handleNavigate("/qa-specialist/applications")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <ClipboardList size={20} />
                <span>Applications</span>
              </Link>
            </li>
            
            {/* Task Validations */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/qa-specialist/task-validations")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/qa-specialist/task-validations"
                onClick={() => handleNavigate("/qa-specialist/task-validations")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <ClipboardCheck size={20} />
                <span>Task Validations</span>
              </Link>
            </li>
            
            {/* Profile */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/qa-specialist/profile")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/qa-specialist/profile"
                onClick={() => handleNavigate("/qa-specialist/profile")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="pb-4 px-2 mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full py-3 flex items-center justify-center gap-2 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ${
            loggingOut
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#0a1e5e] hover:bg-[#0a1e5e]/25 text-white"
          }`}
          disabled={loggingOut}
        >
          <LogOut size={20} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}