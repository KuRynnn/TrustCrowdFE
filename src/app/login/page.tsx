// ✅ File: src/app/login/page.tsx

"use client";

import LoginForm from "@/components/organisms/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0b1e] px-4">
      <div className="max-w-4xl w-full">
        <LoginForm />
      </div>
    </div>
  );
}