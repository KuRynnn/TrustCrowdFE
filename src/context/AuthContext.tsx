// ✅ File: src/context/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/Auth";
import { AuthUser } from "@/types/Auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Used throughout the app (not in useEffect)
  const setUser = (newUser: AuthUser | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
      document.cookie = `token=${newToken}; path=/; max-age=2592000`;
      document.cookie = `accessToken=${newToken}; path=/; max-age=2592000`;
      if (typeof window !== "undefined") {
        (window as any).accessToken = newToken;
      }
    } else {
      localStorage.removeItem("accessToken");
      document.cookie = "token=; path=/; max-age=0";
      document.cookie = "accessToken=; path=/; max-age=0";
      if (typeof window !== "undefined") {
        delete (window as any).accessToken;
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        setTokenState(storedToken);
        (window as any).accessToken = storedToken;

        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.role) {
              if (!["client", "crowdworker", "qa_specialist"].includes(parsedUser.role)) {
                console.warn(`Invalid role in stored user: ${parsedUser.role}, fixing...`);
                parsedUser.role = null;
              }
            }
            setUserState(parsedUser); // ✅ safe here — avoids side-effects
            console.log("User loaded from localStorage with role:", parsedUser?.role);
          } else {
            console.log("No user data in localStorage");
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }

      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out from API");
    } catch (error) {
      console.error("Error logging out from API:", error);
    } finally {
      setToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setUser,
        setToken,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
