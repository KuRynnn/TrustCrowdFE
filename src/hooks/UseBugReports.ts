// ✅ File: src/hooks/UseBugReports.ts

import { useCallback, useEffect, useState } from "react";
import {
  BugReport,
  CreateBugReportData,
  UpdateBugReportData,
} from "@/types/BugReport";
import { BugReportService } from "@/services/BugReportService";

export function useBugReports() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await BugReportService.getAll();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch reports"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    isLoading,
    error,
    fetchReports,
  };
}

export function useBugReportDetail(id: string) {
  const [report, setReport] = useState<BugReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await BugReportService.getById(id);
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch report"));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    isLoading,
    error,
    fetchReport,
  };
}
