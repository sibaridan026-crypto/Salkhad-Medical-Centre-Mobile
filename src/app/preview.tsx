import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';

/**
 * Phase 2 composition preview — superseded.
 *
 * This screen proved the header → greeting → search → centre image → specialty
 * tiles → doctor card layout. The patient home screen (`app/patient/index.tsx`)
 * now owns that composition with real data and working navigation, and its
 * bottom navigation tabs all resolve to real routes.
 *
 * It is kept as a development-only route and redirects everywhere else, so no
 * build ships a preview whose navigation items go nowhere.
 */
export default function Phase2PreviewScreen() {
  const { t } = useLanguage();

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <View style={styles.center}>
      <Text style={styles.title}>{t('brand')}</Text>
      <Text style={styles.body}>
        Phase 2 preview — development only. The patient home screen now owns this
        composition with real specialties and doctors.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  title: { ...Typography.sectionTitle, color: Colors.text, textAlign: 'center' },
  body: { ...Typography.secondary, color: Colors.textSecondary, textAlign: 'center' },
});
