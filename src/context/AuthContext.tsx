import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, fullName: string, agencyName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.error('Profile fetch error:', error.message);
      return null;
    }
    return data as Profile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((s) => ({ ...s, profile, loading: false }));
    }
  }, [state.user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        fetchProfile(session.user.id).then((profile) => {
          if (!mounted) return;
          setState({ user: session.user, session, profile, loading: false });
        });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session) {
          const profile = await fetchProfile(session.user.id);
          if (!mounted) return;
          setState({ user: session.user, session, profile, loading: false });
        } else {
          if (!mounted) return;
          setState({ user: null, session: null, profile: null, loading: false });
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, agencyName?: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, agency_name: agencyName } },
      });
      if (error) return { error: error.message };
      if (!data.user) return { error: 'Sign-up failed. Please try again.' };
      // The DB trigger creates the profile + agency. Give it a moment, then fetch.
      await new Promise((r) => setTimeout(r, 500));
      const profile = await fetchProfile(data.user.id);
      setState({ user: data.user, session: data.session, profile, loading: false });
      return { error: null };
    },
    [fetchProfile],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setState({ user: data.user, session: data.session, profile, loading: false });
    }
    return { error: null };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, profile: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
