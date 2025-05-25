// src/components/organisms/sidebar/ClientSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ListChecks, LogOut, User, Laptop, FileCode } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ClientSidebar() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState("/client/dashboard");
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
          Client Panel
        </h2>
        <nav className="p-2">
          <ul className="space-y-2">
            {/* Dashboard */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/client/dashboard")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/client/dashboard"
                onClick={() => handleNavigate("/client/dashboard")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <Users size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            
            {/* My Applications */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/client/application")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/client/application"
                onClick={() => handleNavigate("/client/application")}
                className="flex items-center gap-3 w-full text-gray-300 hover:text-white transition-all"
              >
                <Laptop size={20} />
                <span>My Applications</span>
              </Link>
            </li>
            
            {/* Profile */}
            <li
              className={`text-sm bg-gradient-to-r p-4 rounded-lg ${
                isActive("/client/profile")
                  ? "border bg-[#5460ff] to-[#032054]"
                  : ""
              }`}
            >
              <Link
                href="/client/profile"
                onClick={() => handleNavigate("/client/profile")}
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