import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '@/i18n/language-context';
import { AppBackground } from '../app-background';
import { AppHeader } from '../app-header';
import { BottomNav, type NavItem } from '../bottom-nav';

export type PatientTab = 'home' | 'specialties' | 'doctors' | 'profile';

const ROUTES: Record<PatientTab, '/patient' | '/patient/specialties' | '/patient/doctors' | '/patient/profile'> = {
  home: '/patient',
  specialties: '/patient/specialties',
  doctors: '/patient/doctors',
  profile: '/patient/profile',
};

/**
 * Shared chrome for the patient area: the brand header (with a working profile
 * shortcut) on top, the screen content in the middle, and the bottom navigation
 * bar. Every tab in `PatientTab` resolves to a real route, so no visible control
 * is inert.
 */
export function PatientScreen({
  activeTab,
  children,
}: {
  activeTab: PatientTab;
  children: ReactNode;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  const items: NavItem[] = [
    { key: 'home', label: t('navHome'), icon: 'home', iconInactive: 'home-outline' },
    {
      key: 'specialties',
      label: t('navSpecialties'),
      icon: 'view-grid',
      iconInactive: 'view-grid-outline',
    },
    { key: 'doctors', label: t('navDoctors'), icon: 'doctor', iconInactive: 'doctor' },
    {
      key: 'profile',
      label: t('navProfile'),
      icon: 'account',
      iconInactive: 'account-outline',
    },
  ];

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.top} edges={['top', 'left', 'right']}>
        <AppHeader
          showNotification
          showProfile
          onNotification={() => router.push('/patient/notifications')}
          onProfile={() => router.push('/patient/profile')}
        />
        <View style={styles.body}>{children}</View>
      </SafeAreaView>

      <BottomNav
        items={items}
        activeKey={activeTab}
        onSelect={(key) => router.replace(ROUTES[key as PatientTab])}
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1 },
  body: { flex: 1 },
});
