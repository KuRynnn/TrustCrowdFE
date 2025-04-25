// ✅ File: src/app/register/page.tsx

"use client";

import RegisterForm from "@/components/organisms/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0b1e] px-4">
      <div className="max-w-4xl w-full">
        <RegisterForm />
      </div>
    </div>
  );
}
