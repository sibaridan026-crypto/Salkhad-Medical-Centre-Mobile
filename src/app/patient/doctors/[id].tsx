import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { DetailHeader } from '@/components/patient/detail-header';
import { Badge, Button, Card, Divider, EmptyState, InlineAlert, LoadingView } from '@/components/ui';
import { Colors, Radius, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { DAY_LABELS } from '@/data/days';
import { useLanguage } from '@/i18n/language-context';
import { localize } from '@/lib/doctor';
import { getDoctorById } from '@/services/doctors';
import { useTheme } from '@/theme';

/** Doctor profile from the backend API, enriched with local presentation data. */
export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const router = useRouter();

  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  if (!id) return <Redirect href="/patient/doctors" />;

  const [doctor, setDoctor] = useState<any | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await getDoctorById(id, lang);
        if (cancelled) return;
        if (result.ok) setDoctor(result.value);
        if (!result.ok) setFailed(true);
      } catch {
        if (cancelled) return;
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, id, lang]);

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  const slots = doctor?.schedule ?? [];

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <DetailHeader title={t('doctorProfileTitle')} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading && !failed ? <LoadingView label={t('loading')} /> : null}

          {failed ? (
            <View style={styles.stateBlock}>
              <InlineAlert variant="danger" title={t('backendPending')} />
              <Button label={t('retry')} variant="secondary" onPress={retry} />
            </View>
          ) : null}

          {!loading && doctor ? (
            <>
              <Card style={styles.identity}>
                <Text style={[styles.name, align, { color: c.text }]}>
                  {doctor.fullName}
                </Text>
                {doctor.specialtyNameAr || doctor.specialtyName ? (
                  <Badge label={lang === 'ar' && doctor.specialtyNameAr ? doctor.specialtyNameAr : doctor.specialtyName} tone="accent" icon="stethoscope" />
                ) : null}
              </Card>

              <Card style={styles.infoCard}>
                <InfoRow
                  label={t('doctorSpecialtyLabel')}
                  value={lang === 'ar' && doctor.specialtyNameAr ? doctor.specialtyNameAr : doctor.specialtyName ?? '—'}
                />
              </Card>

              <View style={styles.scheduleSection}>
                <Text style={[styles.sectionTitle, align, { color: c.text }]}>
                  {t('doctorScheduleTitle')}
                </Text>
                {slots.length === 0 ? (
                  <EmptyState icon="calendar-remove-outline" title={t('doctorNoSchedule')} />
                ) : (
                  <Card style={styles.scheduleCard}>
                    {slots.map((slot: any, index: number) => (
                      <View key={`${slot.day}-${slot.from}-${index}`}>
                        {index > 0 ? <Divider /> : null}
                        <View style={[styles.slotRow, { flexDirection: rowDirection(isRTL) }]}>
                          <Text style={[styles.slotDay, { color: c.text }]}>
                            {localize(DAY_LABELS[slot.day as keyof typeof DAY_LABELS], lang)}
                          </Text>
                          <Text style={[styles.slotTime, { color: c.primary }]}>
                            {slot.to
                              ? `${slot.from} – ${slot.to}`
                              : `${slot.from} · ${t('scheduleOpenEnd')}`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </Card>
                )}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={[styles.ctaBar, { borderColor: c.lavenderBorder }]}>
          <Button
            label={t('bookAppointment')}
            fullWidth
            icon="calendar-plus"
            onPress={() =>
              router.push({
                pathname: '/patient/appointments',
                params: { doctor: doctor?.id ?? '' },
              })
            }
          />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: c.text, textAlign: textAlignment(isRTL) }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  ctaBar: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surface,
  },
  identity: { alignItems: 'center', gap: Spacing.md },
  name: { ...Typography.screenTitle, textAlign: 'center' },
  infoCard: { gap: Spacing.md },
  infoRow: { gap: 2 },
  infoLabel: { ...Typography.caption, fontWeight: '600' },
  infoValue: { ...Typography.body },
  scheduleSection: { gap: Spacing.sm },
  sectionTitle: { ...Typography.sectionTitle },
  scheduleCard: { gap: 0 },
  slotRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  slotDay: { ...Typography.bodyStrong },
  slotTime: { ...Typography.bodyStrong },
  stateBlock: { gap: Spacing.md },
});
