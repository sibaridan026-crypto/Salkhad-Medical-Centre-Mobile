import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { HealthProfile } from '@/data/types';
import {
  register as registerService,
  restoreSession,
  signIn as signInService,
  signOut as signOutService,
  getAuthToken,
  updateAccount,
  type AuthErrorCode,
  type AuthUser,
  type RegisterInput,
} from '@/services/auth';
import {
  emptyHealthProfile,
  loadHealthProfile,
  loadOnboardingState,
  saveHealthProfile,
  saveOnboardingState,
  type OnboardingState,
} from '@/services/health-profile';

/**
 * Patient session state.
 *
 * Storage is local and in-memory only (see `services/storage.ts`): nothing
 * survives an app restart, and no claim is made that it does. The shape here is
 * deliberately the shape a real session would have — a `status` that starts at
 * `loading` while the stored session is restored, an explicit onboarding state,
 * and service-only mutations — so wiring a backend means replacing service
 * bodies, not this context.
 *
 * Onboarding state is explicit (`pending` / `completed` / `skipped`) rather than
 * inferred from "is the profile null", so a patient who skipped onboarding is
 * never shown it again, and editing the health profile later never re-opens the
 * first-run flow.
 */
type SessionStatus = 'loading' | 'ready';

type AuthValue = {
  status: SessionStatus;
  user: AuthUser | null;
  profile: HealthProfile | null;
  onboarding: OnboardingState;
  isAuthenticated: boolean;
  /** JWT access token issued by the backend, or null when unsigned. */
  accessToken: string | null;
  /** True when the initial onboarding still has to be shown this session. */
  needsOnboarding: boolean;
  signIn: (phone: string, password: string) => Promise<AuthErrorCode | null>;
  register: (input: RegisterInput) => Promise<AuthErrorCode | null>;
  signOut: () => Promise<void>;
  completeOnboarding: (profile: HealthProfile) => Promise<void>;
  skipOnboarding: () => Promise<void>;
  /** Saves health-profile edits made later. Never resets onboarding state. */
  saveProfile: (profile: HealthProfile) => Promise<void>;
  saveAccount: (
    patch: Partial<Pick<AuthUser, 'fullName' | 'email' | 'dateOfBirth' | 'gender'>>,
  ) => Promise<AuthErrorCode | null>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState>('pending');

  // Restore whatever local state exists before any screen decides where to go.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [restoredUser, storedToken, storedProfile, storedOnboarding] = await Promise.all([
        restoreSession(),
        getAuthToken(),
        loadHealthProfile(),
        loadOnboardingState(),
      ]);
      if (cancelled) return;
      setUser(restoredUser);
      setAccessToken(storedToken);
      setProfile(storedProfile ?? (restoredUser ? emptyHealthProfile() : null));
      setOnboarding(storedOnboarding);
      setStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (phone: string, password: string): Promise<AuthErrorCode | null> => {
      const result = await signInService(phone, password);
      if (!result.ok) return result.error;
      setUser(result.value);
      setAccessToken(await getAuthToken());
      const [storedProfile, storedOnboarding] = await Promise.all([
        loadHealthProfile(),
        loadOnboardingState(),
      ]);
      setProfile(storedProfile ?? emptyHealthProfile());
      setOnboarding(storedOnboarding);
      return null;
    },
    [],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthErrorCode | null> => {
      const result = await registerService(input);
      if (!result.ok) return result.error;
      setUser(result.value);
      setAccessToken(await getAuthToken());
      // A brand-new account always starts with a fresh health profile and a
      // pending onboarding, regardless of what an earlier account left behind.
      setProfile(emptyHealthProfile());
      setOnboarding('pending');
      await saveOnboardingState('pending');
      return null;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutService();
    setUser(null);
    setAccessToken(null);
    setProfile(null);
    setOnboarding('pending');
  }, []);

  const completeOnboarding = useCallback(async (next: HealthProfile) => {
    const saved = await saveHealthProfile(next);
    await saveOnboardingState('completed');
    setProfile(saved);
    setOnboarding('completed');
  }, []);

  const skipOnboarding = useCallback(async () => {
    // An explicit skip is a permanent answer for this install, not a pending
    // state that will be re-shown on the next launch.
    await saveOnboardingState('skipped');
    setOnboarding('skipped');
  }, []);

  const saveProfile = useCallback(async (next: HealthProfile) => {
    const saved = await saveHealthProfile(next);
    setProfile(saved);
  }, []);

  const saveAccount = useCallback(
    async (
      patch: Partial<
        Pick<AuthUser, 'fullName' | 'email' | 'dateOfBirth' | 'gender'>
      >,
    ): Promise<AuthErrorCode | null> => {
      const result = await updateAccount(patch);
      if (!result.ok) return result.error;
      setUser(result.value);
      return null;
    },
    [],
  );

  const     value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      accessToken,
      profile,
      onboarding,
      isAuthenticated: user !== null,
      needsOnboarding: user !== null && onboarding === 'pending',
      signIn,
      register,
      signOut,
      completeOnboarding,
      skipOnboarding,
      saveProfile,
      saveAccount,
    }),
    [
      status,
      user,
      accessToken,
      profile,
      onboarding,
      signIn,
      register,
      signOut,
      completeOnboarding,
      skipOnboarding,
      saveProfile,
      saveAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
