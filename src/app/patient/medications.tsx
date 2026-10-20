import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { DetailHeader } from '@/components/patient/detail-header';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  InlineAlert,
  LoadingView,
  SectionHeader,
} from '@/components/ui';
import { Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import type { Prescription } from '@/data/types';
import { useLanguage } from '@/i18n/language-context';
import { listPrescriptions } from '@/services/prescriptions';
import { useTheme } from '@/theme';

/**
 * My Medicines â€” physician prescriptions only.
 *
 * The patient's own "current medications" live in the health profile and are
 * self-reported; this screen shows what a doctor prescribed. The two are never
 * merged, because a prescription is a clinician's instruction and must not be
 * edited or re-derived by the patient.
 *
 * There is no backend, so the prescription list is honestly empty and the screen
 * says so instead of inventing a dosage, a frequency or an instruction.
 */
export default function MedicationsScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [items, setItems] = useState<Prescription[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Every setState runs inside the async continuation, never synchronously in
  // the effect body, so a reload cannot cascade extra renders.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await listPrescriptions();
        if (cancelled) return;
        setItems(loaded);
        setFailed(false);
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
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setItems(null);
    setReloadKey((key) => key + 1);
  };

  const align = { textAlign: textAlignment(isRTL) } as const;
  const c = theme.colors;

  return (
    <AppBackground>
      <DetailHeader title={t('medicationsTitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, align, { color: c.textSecondary }]}>
          {t('medicationsSubtitle')}
        </Text>

        {loading && !failed ? <LoadingView label={t('loading')} /> : null}

        {failed ? (
          <View style={styles.stateBlock}>
            <InlineAlert variant="danger" title={t('backendPending')} />
            <Button label={t('retry')} variant="secondary" onPress={retry} />
          </View>
        ) : null}

        {items !== null && !loading && items.length === 0 ? (
          <View style={styles.stateBlock}>
            <EmptyState
              icon="pill"
              title={t('medsEmptyTitle')}
              description={t('medsEmptyBody')}
            />
            <Card style={styles.noteCard}>
              <InlineAlert variant="info" title={t('medsBackendNote')} />
            </Card>
          </View>
        ) : null}

        {!loading &&
          items?.map((item) => (
            <PrescriptionCard key={item.id} prescription={item} />
          ))}

        <SectionHeader title={t('medsHealthProfileTitle')} />
        <Card style={styles.noteCard}>
          <Text style={[styles.body, align, { color: c.textSecondary }]}>
            {t('medsHealthProfileBody')}
          </Text>
          <Button
            label={t('medsOpenHealthProfile')}
            variant="secondary"
            size="sm"
            icon="clipboard-pulse-outline"
            fullWidth
            onPress={() => router.push('/patient/health-profile')}
          />
        </Card>
      </ScrollView>
    </AppBackground>
  );
}

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const { t, isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  const statusLabel =
    prescription.status === 'active'
      ? t('medStatusActive')
      : prescription.status === 'completed'
        ? t('medStatusCompleted')
        : prescription.status === 'cancelled'
          ? t('medStatusCancelled')
          : t('medStatusUnknown');

  const rows: { label: string; value: string }[] = [
    { label: t('medDosage'), value: prescription.dosage ?? t('notProvided') },
    { label: t('medFrequency'), value: prescription.frequency ?? t('notProvided') },
    { label: t('medTiming'), value: prescription.timing ?? t('notProvided') },
    { label: t('medDuration'), value: prescription.duration ?? t('notProvided') },
    { label: t('medInstructions'), value: prescription.instructions ?? t('notProvided') },
    { label: t('medPrescriber'), value: prescription.prescribingDoctor ?? t('notProvided') },
    { label: t('medVisit'), value: prescription.visitId ?? t('notProvided') },
    { label: t('medStart'), value: prescription.startDate ?? t('notProvided') },
    { label: t('medEnd'), value: prescription.endDate ?? t('notProvided') },
  ];

  return (
    <Card style={styles.prescriptionCard}>
      <View style={[styles.headRow, { flexDirection: rowDirection(isRTL) }]}>
        <Text style={[styles.medName, align, { color: c.text }]}>{prescription.medicationName}</Text>
        <View style={[styles.statusPill, { backgroundColor: c.primarySurface }]}>
          <Text style={[styles.statusText, { color: c.primary }]}>{statusLabel}</Text>
        </View>
      </View>

      {rows.map((row, index) => (
        <View key={row.label}>
          {index > 0 ? <Divider /> : null}
          <View style={styles.detailLine}>
            <Text style={[styles.detailLabel, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
              {row.label}
            </Text>
            <Text style={[styles.detailValue, { color: c.text, textAlign: textAlignment(isRTL) }]}>
              {row.value}
            </Text>
          </View>
        </View>
      ))}

      <InlineAlert variant="info" title={t('medsReadOnlyNote')} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  subtitle: { ...Typography.secondary },
  stateBlock: { gap: Spacing.md },
  noteCard: { gap: Spacing.md },
  body: { ...Typography.secondary },
  prescriptionCard: { gap: Spacing.sm },
  headRow: { alignItems: 'center', gap: Spacing.sm },
  medName: { ...Typography.sectionTitle, flex: 1 },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusText: { ...Typography.micro, fontWeight: '700' },
  detailLine: { gap: 2, paddingVertical: Spacing.sm },
  detailLabel: { ...Typography.caption, fontWeight: '600' },
  detailValue: { ...Typography.body },
});
