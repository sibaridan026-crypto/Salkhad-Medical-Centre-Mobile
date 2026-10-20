import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';

/**
 * Phase 1 foundation screen — superseded.
 *
 * The Phase 1 verification route (background + tokens + card system) has done
 * its job: those foundations are now used by every real screen. It is kept as a
 * development-only inspection route and redirects everywhere else, so no
 * production build ships a screen that only exists to prove a past phase.
 */
export default function FoundationScreen() {
  const { t } = useLanguage();

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <View style={styles.center}>
      <Text style={styles.title}>{t('brand')}</Text>
      <Text style={styles.body}>
        Phase 1 foundation screen — development only. Removed from the production
        navigation; the patient home screen now uses these foundations.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  title: { ...Typography.sectionTitle, color: Colors.text, textAlign: 'center' },
  body: { ...Typography.secondary, color: Colors.textSecondary, textAlign: 'center' },
});
