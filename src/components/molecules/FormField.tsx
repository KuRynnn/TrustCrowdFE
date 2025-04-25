import React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

type FormFieldType = "text" | "email" | "password" | "textarea" | "select";

type SelectOption = {
  value: string;
  label: string;
};

type FormFieldProps = {
  label: string;
  name: string;
  type: FormFieldType;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  options?: SelectOption[];
  className?: string;
};

export default function FormField({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  options = [],
  className = "",
}: FormFieldProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelectChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className="w-full"
          required={required}
        />
      ) : type === "select" ? (
        <Select value={value} onValueChange={handleSelectChange} required={required}>
          <SelectTrigger id={name} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className="w-full"
          required={required}
        />
      )}
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}