import React from "react";
import { cn } from "@/lib/Utils";

type StatusType = 
  | "success" 
  | "error" 
  | "warning" 
  | "info" 
  | "pending" 
  | "active" 
  | "inactive";

type StatusBadgeProps = {
  status: StatusType;
  label?: string;
  className?: string;
};

export default function StatusBadge({ 
  status, 
  label, 
  className 
}: StatusBadgeProps) {
  const statusConfig = {
    success: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      defaultLabel: "Success"
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      defaultLabel: "Error"
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      defaultLabel: "Warning"
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      defaultLabel: "Info"
    },
    pending: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      defaultLabel: "Pending"
    },
    active: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      defaultLabel: "Active"
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      defaultLabel: "Inactive"
    }
  };

  const { bg, text, border, defaultLabel } = statusConfig[status];
  const displayLabel = label || defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        bg,
        text,
        border,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}