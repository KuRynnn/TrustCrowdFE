"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLogin } from "@/hooks/UseAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return; // Form validation will handle this
    }
    
    await loginUser(email, password);

    // Debug: Check if token was stored after login
    console.log("After login, token in localStorage:", localStorage.getItem("accessToken"));
  };

  return (
    <section className="rounded-3xl p-px border border-[#5b0ba1] bg-gradient-to-r from-[#5b0ba1] to-transparent">
      <div className="lg:grid grid-cols-2">
        <div className="col-span-1 lg:flex hidden items-center justify-center">
          <Image
            src="/icons/login-illustration.svg"
            width={400}
            height={100}
            alt="login-illustration"
          />
        </div>
        <div className="col-span-1 text-white flex flex-col px-4 justify-center py-12 items-center w-full">
          <div className="text-left mb-8 w-full">
            <h1 className="text-2xl items-center gap-2">
              Hi, Welcome <br /> to{" "}
              <span className="text-white font-semibold">TrustCrowd©</span>
            </h1>
          </div>
          <div className="w-full">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  required
                />
              </div>
              <div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                  required
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#4c0e8f] border border-[#001333]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
          <span className="text-center text-white w-full my-4 text-sm">
            {`Don't`} have account?{" "}
            <Link href="/register" className="font-semibold">
              Register
            </Link>
          </span>
          <div className="flex flex-col gap-2 w-full mt-4">
            <Button disabled variant="outline" className="w-full">
              <Image
                src="/icons/google-icon.svg"
                width={23}
                height={23}
                alt="Google icon"
              />
              Continue with Google
            </Button>
            <Button disabled variant="outline" className="w-full">
              <Image
                src="/icons/github-icon.svg"
                width={23}
                height={23}
                alt="GitHub icon"
              />
              Continue with GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}