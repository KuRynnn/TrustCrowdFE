// src/app/applications/new/page.tsx
import ApplicationForm from '@/components/organisms/applications/ApplicationForm';

export default function NewApplicationPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Application</h1>
      <ApplicationForm />
    </div>
  );
}