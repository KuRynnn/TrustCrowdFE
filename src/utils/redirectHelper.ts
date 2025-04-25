// src/utils/redirectHelper.ts
export const redirectBasedOnRole = (role: string | null) => {
    if (!role) return '/dashboard';
    
    switch (role) {
      case 'qa_specialist':
        return '/qa-specialist/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'crowdworker':
        return '/crowdworker/dashboard';
      default:
        return '/dashboard';
    }
  };