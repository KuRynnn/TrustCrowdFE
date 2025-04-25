// ✅ File: src/hooks/useAuth.ts

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, logout } from "@/lib/Auth";
import { useAuth } from "@/context/AuthContext";
import { redirectBasedOnRole } from '@/utils/redirectHelper';

export function useLogin() {
  const { setToken, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Login and get token
      const { access_token, user } = await login(email, password);
      
      // Set token
      setToken(access_token);
      
      // Set user data from response
      setUser(user);
      console.log("User data set from login response:", user);
      
      // Force a delay to ensure token is set before redirect
      setTimeout(() => {
        const dashboardPath = redirectBasedOnRole(user.role);
        window.location.href = dashboardPath;
      }, 300);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, loading, error };
}

export function useRegister() {
  const { setToken, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In useRegister hook
  const registerUser = async (formData: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        user_type: formData.role,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
        ...(formData.role === "client" && { company: formData.company }),
        ...(formData.role === "crowdworker" && { skills: formData.skills }),
        ...(formData.role === "qa_specialist" && { expertise: formData.expertise }),
      };

      // Register and get token
      const { access_token, user } = await register(payload);
      
      // Ensure the user has the role set
      const userWithRole = {
        ...user,
        role: formData.role // Use the role from the form data
      };
      
      console.log("Setting user with explicit role:", userWithRole);
      
      // Set token
      setToken(access_token);
      
      // Set user data with guaranteed role
      setUser(userWithRole);
      
      // Force a delay to ensure token is set before redirect
      setTimeout(() => {
        // Redirect based on role
        switch (formData.role) {
          case 'qa_specialist':
            window.location.href = "/qa-specialist/dashboard";
            break;
          case 'client':
            window.location.href = "/client/dashboard";
            break;
          case 'crowdworker':
            window.location.href = "/crowdworker/dashboard";
            break;
          default:
            window.location.href = "/dashboard";
        }
      }, 300);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return { registerUser, loading, error };
}
