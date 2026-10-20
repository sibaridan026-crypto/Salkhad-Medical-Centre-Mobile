import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CenterCard } from '@/components/center-card';
import { DoctorCard } from '@/components/doctor-card';
import { Icon, type IconName } from '@/components/icon';
import { PatientScreen } from '@/components/patient/patient-screen';
import { SearchField } from '@/components/search-field';
import { SpecialtyTile } from '@/components/specialty-tile';
import { Button, Card, SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { DOCTOR_PHOTOS } from '@/data/doctor-photos';
import { DOCTORS } from '@/data/doctors';
import { SPECIALTIES } from '@/data/specialties';
import { SPECIALTY_ACCENT, SPECIALTY_GLYPH } from '@/data/specialty-visuals';
import { useLanguage } from '@/i18n/language-context';
import { doctorDisplayName, getSpecialty, localize } from '@/lib/doctor';
import { useTheme } from '@/theme';

/** Patient home. Uses local static specialty/doctor data (not from the backend yet). */
export default function PatientHomeScreen() {
  const router = useRouter();
  const { t, lang, isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  const featuredSpecialties = SPECIALTIES.slice(0, 3);
  const featuredDoctors = DOCTORS.slice(0, 3);

  /** Secondary services live here, not in the bottom navigation. */
  const quickActions: { key: string; label: string; icon: IconName; onPress: () => void }[] = [
    {
      key: 'appointments',
      label: t('actionAppointments'),
      icon: 'calendar-month-outline',
      onPress: () => router.push('/patient/appointments'),
    },
    {
      key: 'medications',
      label: t('actionMedications'),
      icon: 'pill',
      onPress: () => router.push('/patient/medications'),
    },
    {
      key: 'records',
      label: t('actionRecords'),
      icon: 'folder-account-outline',
      onPress: () => router.push('/patient/medical-file'),
    },
    {
      key: 'qr',
      label: t('actionQr'),
      icon: 'qrcode',
      onPress: () => router.push('/patient/qr'),
    },
  ];

  return (
    <PatientScreen activeTab="home">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, align, { color: c.text }]} numberOfLines={1}>
            {t('greeting')}
          </Text>
          <Text style={[styles.greetingSubtitle, align, { color: c.textSecondary }]} numberOfLines={2}>
            {t('subtitle')}
          </Text>
        </View>

        <SearchField onPress={() => router.push('/patient/doctors')} />

        <Card style={[styles.bookingCard, { borderColor: c.lavenderBorder }]}>
          <View style={[styles.bookingHead, { flexDirection: rowDirection(isRTL) }]}>
            <View style={[styles.bookingWell, { backgroundColor: c.primarySurface }]}>
              <Icon name="calendar-plus" size={22} color={c.primary} />
            </View>
            <View style={styles.bookingText}>
              <Text style={[styles.bookingTitle, align, { color: c.text }]}>
                {t('bookTitle')}
              </Text>
              <Text style={[styles.bookingSubtitle, align, { color: c.textSecondary }]}>
                {t('bookSubtitle')}
              </Text>
            </View>
          </View>
          <Button
            label={t('bookNew')}
            fullWidth
            icon="calendar-arrow-right"
            onPress={() => router.push({ pathname: '/patient/appointments', params: { book: '1' } })}
          />
        </Card>

        <View style={styles.section}>
          <SectionHeader title={t('quickActionsTitle')} />
          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.quickCard,
                  {
                    backgroundColor: pressed ? c.lavender : c.surface,
                    borderColor: c.lavenderBorder,
                  },
                ]}
              >
                <View style={[styles.quickWell, { backgroundColor: c.primarySurface }]}>
                  <Icon name={action.icon} size={20} color={c.primary} />
                </View>
                <Text style={[styles.quickLabel, align, { color: c.text }]} numberOfLines={2}>
                  {action.label}
                </Text>
                <Icon
                  name={isRTL ? 'chevron-left' : 'chevron-right'}
                  size={16}
                  color={c.textMuted}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <CenterCard />

        <View style={styles.section}>
          <SectionHeader
            title={t('homeSpecialtiesTitle')}
            action={t('viewAll')}
            onAction={() => router.push('/patient/specialties')}
          />
          <View style={[styles.tileRow, { flexDirection: rowDirection(isRTL) }]}>
            {featuredSpecialties.map((item) => (
              <SpecialtyTile
                key={item.id}
                name={localize(item.name, lang)}
                icon={SPECIALTY_GLYPH[item.id]}
                accent={SPECIALTY_ACCENT[item.id]}
                onPress={() => router.push(`/patient/specialties/${item.id}`)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={t('homeDoctorsTitle')}
            action={t('viewAll')}
            onAction={() => router.push('/patient/doctors')}
          />
          <View style={styles.list}>
            {featuredDoctors.map((doctor) => {
              const specialty = getSpecialty(doctor.specialtyId);
              return (
                <DoctorCard
                  key={doctor.id}
                  name={doctorDisplayName(doctor, lang)}
                  specialty={specialty ? localize(specialty.name, lang) : ''}
                  photo={DOCTOR_PHOTOS[doctor.id]}
                  onPress={() => router.push(`/patient/doctors/${doctor.id}`)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  greeting: { gap: 2 },
  greetingTitle: { ...Typography.screenTitle, color: Colors.text },
  greetingSubtitle: { ...Typography.secondary, color: Colors.textSecondary },
  bookingCard: { gap: Spacing.md },
  bookingHead: { alignItems: 'center', gap: Spacing.md },
  bookingWell: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingText: { flex: 1, minWidth: 0, gap: 2 },
  bookingTitle: { ...Typography.sectionTitle },
  bookingSubtitle: { ...Typography.caption },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  quickCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  quickWell: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...Typography.caption, fontWeight: '600' },
  section: { gap: Spacing.sm },
  tileRow: { gap: Spacing.sm },
  list: { gap: Spacing.md },
});
