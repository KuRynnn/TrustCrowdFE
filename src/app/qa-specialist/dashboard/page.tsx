"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QASpecialistSidebar from "@/components/organisms/sidebar/QASpecialistSidebar";
import { applicationService } from "@/services/ApplicationService";
import { uatTaskService } from "@/services/UatTaskService";
import Link from "next/link";
import { Clock, CheckSquare, AlertCircle, CheckCircle } from "lucide-react";
import { Application, ApplicationStatistics } from "@/types/Application";
import { UATTask } from "@/types/UATTask";

interface DashboardStats {
  totalApplications: number;
  pendingValidations: number;
  recentTestCases: Array<{
    test_id: string;
    test_title: string;
    test_steps: string;
    expected_result: string;
    priority: string;
    qa_id: string;
  }>;
  criticalBugs: number;
}

export default function QASpecialistDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingValidations: 0,
    recentTestCases: [],
    criticalBugs: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not a QA specialist
    if (!loading && user && user.role !== "qa_specialist") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!loading && user && user.role === "qa_specialist") {
        try {
          setIsLoading(true);
          
          // Get all applications
          const applications = await applicationService.getAllApplications();
          
          // Try to get completed tasks that need validation
          let tasksNeedingValidation: UATTask[] = [];
          try {
            console.log("Attempting to fetch tasks with status 'Completed'");
            tasksNeedingValidation = await uatTaskService.getTasksByStatus('Completed');
            console.log("Successfully fetched tasks:", tasksNeedingValidation);
          } catch (error) {
            console.error("Error fetching completed tasks:", error);
            tasksNeedingValidation = []; // Set to empty array on error
          }
          
          // Initialize critical bugs count
          let criticalBugsCount = 0;
          let recentTestCasesList: Array<{
            test_id: string;
            test_title: string;
            test_steps: string;
            expected_result: string;
            priority: string;
            qa_id: string;
          }> = [];
          
          // If there are applications, get the statistics for the first few
          if (applications.length > 0) {
            // Get test cases from the first application that has them
            for (const app of applications) {
              if (app.test_cases && app.test_cases.length > 0) {
                recentTestCasesList = app.test_cases.slice(0, 3);
                break;
              }
            }
            
            // Get statistics for critical bugs - check up to 3 applications
            const appsToCheck = applications.slice(0, 3);
            for (const app of appsToCheck) {
              try {
                // Use the statistics endpoint from your API
                const appStats = await applicationService.getApplicationStatistics(app.app_id);
                if (appStats && appStats.bugs_by_severity && appStats.bugs_by_severity.Critical) {
                  criticalBugsCount += appStats.bugs_by_severity.Critical;
                }
              } catch (error) {
                console.error(`Error fetching statistics for application ${app.app_id}:`, error);
                // Continue with the next application if one fails
              }
            }
          }
          
          setStats({
            totalApplications: applications.length,
            pendingValidations: tasksNeedingValidation.length,
            recentTestCases: recentTestCasesList,
            criticalBugs: criticalBugsCount
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchDashboardData();
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0b1e] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0e0b1e]">
      {/* Sidebar */}
      <div className="w-64">
        <QASpecialistSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              QA Specialist Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <div className="px-4 py-2 bg-[#1a1a2e] rounded-lg text-sm">
            <p>Last login: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center">
            <div className="bg-blue-500/20 p-3 rounded-full mr-4">
              <CheckSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-xl font-bold">{stats.totalApplications}</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center">
            <div className="bg-purple-500/20 p-3 rounded-full mr-4">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Validations</p>
              <p className="text-xl font-bold">{stats.pendingValidations}</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center">
            <div className="bg-red-500/20 p-3 rounded-full mr-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Critical Bugs</p>
              <p className="text-xl font-bold">{stats.criticalBugs}</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a2e] p-4 rounded-lg flex items-center">
            <div className="bg-green-500/20 p-3 rounded-full mr-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Your Expertise</p>
              <p className="text-sm font-medium truncate">
                {user?.role === "qa_specialist" ? (user as any).expertise || "Not specified" : "Not specified"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1a1a2e] p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Applications</h2>
            <p className="text-gray-400 mb-3">Review and manage applications for UAT testing.</p>
            <div className="bg-[#212145] p-3 rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Total</span>
                <span className="text-white font-medium">{stats.totalApplications}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-[#4c0e8f] h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <button 
              onClick={() => router.push("/qa-specialist/applications")}
              className="w-full mt-2 px-4 py-2.5 bg-[#4c0e8f] hover:bg-[#3a0b6b] transition-colors rounded-md font-medium flex items-center justify-center"
            >
              View Applications
            </button>
          </div>
          
          <div className="bg-[#1a1a2e] p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
            <p className="text-gray-400 mb-3">Create and manage test cases for applications.</p>
            <div className="bg-[#212145] p-3 rounded-md mb-4">
              <p className="text-sm text-gray-400 mb-2">Recent Test Cases:</p>
              {stats.recentTestCases.length > 0 ? (
                <ul className="space-y-2">
                  {stats.recentTestCases.map((testCase, index) => (
                    <li key={index} className="text-sm truncate">
                      • {testCase.test_title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent test cases</p>
              )}
            </div>
            <button 
              onClick={() => router.push("/qa-specialist/applications")}
              className="w-full mt-2 px-4 py-2.5 bg-[#4c0e8f] hover:bg-[#3a0b6b] transition-colors rounded-md font-medium flex items-center justify-center"
            >
              Manage Test Cases
            </button>
          </div>
          
          <div className="bg-[#1a1a2e] p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Task Validations</h2>
            <p className="text-gray-400 mb-3">Validate tasks completed by crowdworkers.</p>
            <div className="bg-[#212145] p-3 rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Pending</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  stats.pendingValidations > 5 ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'
                }`}>
                  {stats.pendingValidations} tasks
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${stats.pendingValidations > 5 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(100, stats.pendingValidations * 10)}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={() => router.push("/qa-specialist/task-validations")}
              className="w-full mt-2 px-4 py-2.5 bg-[#4c0e8f] hover:bg-[#3a0b6b] transition-colors rounded-md font-medium flex items-center justify-center"
            >
              View Validations
            </button>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1a1a2e] p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-2 border-green-500 pl-4 py-1">
                <p className="text-gray-300">Task validated</p>
                <p className="text-sm text-gray-400">You validated a task for Application X</p>
                <p className="text-xs text-gray-500 mt-1">Today, 10:24 AM</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-4 py-1">
                <p className="text-gray-300">Test case created</p>
                <p className="text-sm text-gray-400">You created a new test case for Application Y</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday, 2:15 PM</p>
              </div>
              <div className="border-l-2 border-purple-500 pl-4 py-1">
                <p className="text-gray-300">Bug verified</p>
                <p className="text-sm text-gray-400">You verified a critical bug in Application Z</p>
                <p className="text-xs text-gray-500 mt-1">Apr 12, 2025</p>
              </div>
            </div>
            <Link href="/qa-specialist/activity" className="text-sm text-blue-400 hover:underline inline-block mt-4">
              View all activity
            </Link>
          </div>
          
          <div className="bg-[#1a1a2e] p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="bg-[#212145] p-4 rounded-md mb-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4c0e8f] flex items-center justify-center text-xl font-bold">
                  {user?.name?.charAt(0) || "?"}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-400">QA Specialist</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Expertise</p>
                  <p className="text-sm">{user?.role === "qa_specialist" ? (user as any).expertise || "Not specified" : "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Member Since</p>
                  <p className="text-sm">April 2025</p>
                </div>
              </div>
            </div>
            <Link href="/profile" className="text-[#4c0e8f] hover:underline text-sm font-medium">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}