"use client";

import { useState } from "react";
import { Users, LogOut, ClipboardList, ListChecks, CheckSquare, ClipboardCheck, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function QASpecialistSidebar() {
  const [activePath, setActivePath] = useState("/validator/validate-question");
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();

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
    <aside className="bg-[#001333] h-screen text-white col-span-2 flex flex-col justify-between shadow-xl overflow-hidden">
      <div>
        <h2 className="text-2xl text-center font-bold mb-6 text-gray-200 p-4 mt-4">
          QA Specialist Panel
        </h2>
        <nav className="p-2">
          <ul className="space-y-2">
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
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/qa-specialist/bug-validations")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/qa-specialist/bug-validations"
                onClick={() => handleNavigate("/qa-specialist/bug-validations")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <CheckSquare size={20} />
                <span>Bug Validations</span>
              </Link>
            </li>
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
      <div className="p-2">
        <button
          onClick={handleLogout}
          className={`w-full py-3 flex items-center justify-center gap-2 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ${
            loggingOut
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#5460ff] to-[#032054] text-white"
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
