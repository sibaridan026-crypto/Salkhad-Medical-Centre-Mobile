import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';

import { AppBackground } from '@/components/app-background';
import { Colors, Spacing, Typography } from '@/constants/brand';
import { useAuth } from '@/state/auth-context';

/**
 * Entry gate.
 *
 * `index` owns no navigation UI: it decides where the patient starts once the
 * stored session has been restored.
 *
 *   - still restoring → a neutral loading screen, so the onboarding decision is
 *     never made before the real state is known (this is what prevents the
 *     onboarding from flashing at returning patients)
 *   - signed out            → sign in
 *   - signed in, onboarding pending → initial health-profile onboarding
 *   - signed in, completed or skipped → patient area
 *
 * `needsOnboarding` is explicit state, not "is the profile null", so a patient
 * who skipped the onboarding is not shown it again on the next launch, and
 * opening the health profile later from the profile tab does not re-trigger the
 * first-run flow.
 */
export default function Index() {
  const { status, isAuthenticated, needsOnboarding } = useAuth();

  if (status === 'loading') return <GateLoading />;

  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  if (needsOnboarding) return <Redirect href="/auth/health-profile" />;
  return <Redirect href="/patient" />;
}

function GateLoading() {
  return (
    <AppBackground edges={[]}>
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.label}>جارٍ التحقق من الجلسة…</Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  label: { ...Typography.secondary, color: Colors.textSecondary },
});
