import Link from 'next/link';
import { CheckCircle, Users, Code, Bug, ClipboardList, ListChecks } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#001333] to-[#0a1e3b] text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                UAT Crowdsourcing Platform
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Streamline your User Acceptance Testing with our comprehensive crowdsourcing platform. Connect clients, QA specialists, and crowdworkers in one seamless environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/login" 
                  className="px-6 py-3 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg font-medium text-center transition-colors"
                >
                  Login to Platform
                </Link>
                <Link 
                  href="/register" 
                  className="px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium text-center transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
                <div className="relative bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm text-gray-400">UAT Dashboard</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 bg-gray-700 rounded w-full"></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-24 bg-gray-700 rounded"></div>
                      <div className="h-24 bg-gray-700 rounded"></div>
                      <div className="h-24 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-32 bg-gray-700 rounded w-full"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-gray-700 rounded"></div>
                      <div className="h-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-[#0a1e3b]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comprehensive UAT Platform</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#001333] p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Application Management</h3>
              <p className="text-gray-400">
                Register and manage applications for testing. Track application versions and testing progress.
              </p>
            </div>
            
            <div className="bg-[#001333] p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Test Case Creation</h3>
              <p className="text-gray-400">
                Create detailed test cases with steps, expected results, and priorities. Organize test cases by application.
              </p>
            </div>
            
            <div className="bg-[#001333] p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <ListChecks className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">UAT Task Assignment</h3>
              <p className="text-gray-400">
                Assign UAT tasks to crowdworkers. Track task progress from assignment to completion.
              </p>
            </div>
            
            <div className="bg-[#001333] p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <Bug className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bug Reporting</h3>
              <p className="text-gray-400">
                Comprehensive bug reporting with severity levels, steps to reproduce, and screenshots.
              </p>
            </div>
            
            <div className="bg-[#001333] p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bug Validation</h3>
              <p className="text-gray-400">
                QA specialists validate reported bugs, ensuring quality and accuracy of bug reports.
              </p>
            </div>
            
            <div className="bg-[#001333] p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
              <p className="text-gray-400">
                Specialized interfaces for clients, QA specialists, and crowdworkers with role-appropriate features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">For Every Role in the UAT Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-800/50">
              <h3 className="text-2xl font-semibold mb-4">Clients</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Register applications for testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Monitor testing progress in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Review bug reports and validations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Access comprehensive testing analytics</span>
                </li>
              </ul>
              <Link 
                href="/register?role=client" 
                className="block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Register as Client
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-8 rounded-xl border border-purple-800/50">
              <h3 className="text-2xl font-semibold mb-4">QA Specialists</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Create and manage test cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Assign UAT tasks to crowdworkers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Validate reported bugs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Generate detailed testing reports</span>
                </li>
              </ul>
              <Link 
                href="/register?role=qa_specialist" 
                className="block text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Register as QA Specialist
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-8 rounded-xl border border-green-800/50">
              <h3 className="text-2xl font-semibold mb-4">Crowdworkers</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Accept and complete UAT tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Report bugs with detailed information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Track task completion and earnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Build a testing portfolio and reputation</span>
                </li>
              </ul>
              <Link 
                href="/register?role=crowdworker" 
                className="block text-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                Register as Crowdworker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#0a1e3b]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your UAT Process?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our platform today and experience the benefits of crowdsourced User Acceptance Testing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-3 bg-[#5460ff] hover:bg-[#4450dd] rounded-lg font-medium text-center transition-colors"
            >
              Get Started Now
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium text-center transition-colors"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2025 UAT Crowdsourcing Platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
