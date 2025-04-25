"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRegister } from "@/hooks/UseAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { UserRole } from "@/types/Auth";

export default function RegisterForm() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    company: "",
    skills: "",
    expertise: "",
  });

  const { registerUser, loading, error } = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;
    
    registerUser({
      role: selectedRole,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      passwordConfirmation: formData.passwordConfirmation,
      ...(selectedRole === 'client' && { company: formData.company }),
      ...(selectedRole === 'crowdworker' && { skills: formData.skills }),
      ...(selectedRole === 'qa_specialist' && { expertise: formData.expertise }),
    });
  };

  const renderRoleSelection = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-center">Select your role</h2>
      <Button 
        className="bg-[#4c0e8f] border border-[#001333] p-6" 
        onClick={() => handleRoleSelect("client")}
      >
        I'm a Client
      </Button>
      <Button 
        className="bg-[#4c0e8f] border border-[#001333] p-6" 
        onClick={() => handleRoleSelect("crowdworker")}
      >
        I'm a Crowdworker
      </Button>
      <Button 
        className="bg-[#4c0e8f] border border-[#001333] p-6" 
        onClick={() => handleRoleSelect("qa_specialist")}
      >
        I'm a QA Specialist
      </Button>
    </div>
  );

  const renderRegistrationForm = () => (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <Input 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
        </div>
        <div>
          <Input 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <Input 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email" 
          type="email"
          required
        />
      </div>
      <div className="mb-3">
        <Input
          name="password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <div className="mb-3">
        <Input
          name="passwordConfirmation"
          value={formData.passwordConfirmation}
          onChange={handleChange}
          type="password"
          placeholder="Confirm Password"
          required
        />
      </div>

      {/* Role-specific fields */}
      {selectedRole === 'client' && (
        <div className="mb-6">
          <Input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company Name"
            required
          />
        </div>
      )}

      {selectedRole === 'crowdworker' && (
        <div className="mb-6">
          <Input
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Skills (e.g., Testing, Development, Design)"
            required
          />
        </div>
      )}

      {selectedRole === 'qa_specialist' && (
        <div className="mb-6">
          <Input
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            placeholder="Areas of Expertise"
            required
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          className="w-1/3 bg-gray-600"
          onClick={() => setStep('role')}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="w-2/3 bg-[#4c0e8f] border border-[#001333]"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
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
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <section className="rounded-3xl p-px border border-[#5b0ba1] bg-gradient-to-r from-[#5b0ba1] to-transparent">
      <div className="lg:grid grid-cols-2">
        <div className="col-span-1 hidden lg:flex items-center justify-center">
          <Image
            src="/logo-uat.png"
            width={400}
            height={100}
            alt="UAT Logo"
          />
        </div>

        <div className="col-span-1 text-white flex flex-col px-4 justify-center py-12 w-full">
          <div className="text-left mb-8 w-full">
            <h1 className="text-2xl items-center gap-2">
              <span className="text-white font-semibold">Registration</span>
            </h1>
            <p className="text-white text-sm mt-2">
              Registering is quick and easy! Just fill out the form below, and{" "}
              {`you'll`} be on your way to enjoying everything{" "}
              <strong>TrustCrowd©</strong> has to offer
            </p>
          </div>
          
          {step === 'role' ? renderRoleSelection() : renderRegistrationForm()}
          
          {error && <p className="text-red-400 mt-4">{error}</p>}
          
          <span className="text-center w-full my-4 text-sm text-white">
            I have account?{" "}
            <Link href="/login" className="font-semibold text-white">
              Login
            </Link>
          </span>
          
          <div className="flex flex-col gap-2 w-full">
            <Button disabled variant="outline" className="w-full">
              <Image
                src="/icons/google-icon.svg"
                width={23}
                height={23}
                alt="Google Icon"
              />
              Email
            </Button>
            <Button disabled variant="outline" className="w-full">
              <Image
                src="/icons/github-icon.svg"
                width={23}
                height={23}
                alt="Github Icon"
              />
              Github
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}