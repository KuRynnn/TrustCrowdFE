// ✅ File: src/lib/auth.ts

import apiClient from "@/lib/ApiClient";
import { AuthUser } from "@/types/Auth";

export async function login(email: string, password: string) {
  const response = await apiClient.post("/auth/login", { email, password });
  // Extract data from the response structure
  const responseData = response.data.data;
  
  // Debug the response to see what we're getting
  console.log("Login response:", responseData);
  
  // Ensure role is one of the expected values
  let role = responseData.role;
  if (!role || !["client", "crowdworker", "qa_specialist"].includes(role)) {
    console.warn(`Unexpected role value: ${role}, defaulting to null`);
    role = null;
  }
  
  // Create user object with role included
  const user = {
    ...responseData.user,
    role: role // Add validated role from response
  };
  
  console.log("Processed user with role:", user);
  
  return {
    access_token: responseData.token,
    user: user
  };
}

export async function register(data: any) {
  const response = await apiClient.post("/auth/register", data);
  // Extract data from the response structure
  const responseData = response.data.data;
  
  // Debug the response to see what we're getting
  console.log("Register response:", responseData);
  
  // Ensure role is one of the expected values
  let role = responseData.role;
  if (!role || !["client", "crowdworker", "qa_specialist"].includes(role)) {
    console.warn(`Unexpected role value: ${role}, defaulting to null`);
    role = null;
  }
  
  // Create user object with role included
  const user = {
    ...responseData.user,
    role: role // Add validated role from response
  };
  
  console.log("Processed user with role:", user);
  
  return {
    access_token: responseData.token,
    user: user
  };
}

export async function logout() {
  const response = await apiClient.post("/auth/logout");
  return response.data;
}
