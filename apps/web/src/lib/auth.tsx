import { ClerkProvider, SignIn, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import type { ReactNode } from 'react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Auth provider that wraps the app with Clerk.
 * When VITE_CLERK_PUBLISHABLE_KEY is not set, auth is bypassed
 * for local development.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!CLERK_PUBLISHABLE_KEY) {
    // Dev mode — no auth
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-brand-800">BPMN Process Mapper</h1>
              <p className="text-gray-500 mt-1">Sign in to manage your process maps</p>
            </div>
            <SignIn />
          </div>
        </div>
      </SignedOut>
    </ClerkProvider>
  );
}

/**
 * Re-export UserButton for use in the header.
 * Falls back to a placeholder when Clerk is not configured.
 */
export function AuthUserButton() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-medium">
        D
      </div>
    );
  }

  return <UserButton afterSignOutUrl="/" />;
}

/**
 * Hook-like helper to get the current user ID.
 * Returns 'dev-user-001' when auth is not configured.
 */
export function useCurrentUserId(): string {
  // In production with Clerk, this would use useUser() hook
  // For now, return a dev user ID that matches the API's SKIP_AUTH behavior
  return 'dev-user-001';
}
