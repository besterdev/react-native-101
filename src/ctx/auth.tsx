import { createContext, use, type PropsWithChildren } from 'react';

import { useStorageState } from '@/hooks/use-storage-state';

const AuthContext = createContext<{
  signIn: (email: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
} | null>(null);

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}
export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: (email: string) => {
          setSession(email.trim());
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
