import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import type { HealthSection, MedicalVisit } from '@/data/types';
import { useLanguage } from '@/i18n/language-context';
import { answeredCount, emptyHealthProfile } from '@/services/health-profile';
import { listVisits } from '@/services/medical-records';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * My Medical File â€” ONE combined section.
 *
 * Two subsections live here, and they are deliberately not the same kind of
 * data:
 *
 *   A. My Health Information â€” what the patient reported themselves. It is read
 *      from the health-profile service and edited on the dedicated editable
 *      health-profile screen; nothing here is clinician authored.
 *   B. My Medical Records â€” visits produced by medical care. Read-only for the
 *      patient, and empty until a secure backend supplies them.
 *
 * The two are never merged: patient-entered notes must not be presented as a
 * physician's record.
 */
export default function MedicalFileScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<MedicalVisit[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Every setState runs inside the async continuation, never synchronously in
  // the effect body, so a reload cannot cascade extra renders.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await listVisits();
        if (cancelled) return;
        setVisits(loaded);
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
    setVisits(null);
    setReloadKey((key) => key + 1);
  };

  const align = { textAlign: textAlignment(isRTL) } as const;
  const c = theme.colors;

  const saved = profile ?? emptyHealthProfile();
  const answered = useMemo(() => answeredCount(saved), [saved]);

  return (
    <AppBackground>
      <DetailHeader title={t('medicalFileTitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* A. Health information */}
        <SectionHeader title={t('medicalFileHealthInfoTitle')} />
        <Card style={styles.card}>
          <Text style={[styles.summary, align, { color: c.text }]}>
            {answered > 0
              ? t('profileHealthSummary').replace('{count}', String(answered))
              : t('profileHealthEmpty')}
          </Text>
          <Text style={[styles.hint, align, { color: c.textMuted }]}>
            {t('healthProfileSubtitle')}
          </Text>

          <View style={styles.list}>
            <HealthRow label={t('reviewConditions')} section={saved.chronicConditions} />
            <Divider />
            <HealthRow label={t('reviewSurgeries')} section={saved.previousSurgeries} />
            <Divider />
            <HealthRow label={t('reviewAllergies')} section={saved.drugAllergies} />
            <Divider />
            <HealthRow label={t('reviewMedications')} section={saved.currentMedications} />
            <Divider />
            <View style={styles.healthRow}>
              <Text style={[styles.rowLabel, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
                {t('reviewOther')}
              </Text>
              <Text style={[styles.rowValue, { color: c.text, textAlign: textAlignment(isRTL) }]}>
                {saved.otherNotes.trim() ? saved.otherNotes.trim() : t('reviewEmptySection')}
              </Text>
            </View>
          </View>

          <Button
            label={answered > 0 ? t('profileHealthEdit') : t('profileHealthFill')}
            variant="secondary"
            size="sm"
            icon="clipboard-pulse-outline"
            fullWidth
            onPress={() => router.push('/patient/health-profile')}
          />
          <Text style={[styles.hint, align, { color: c.textMuted }]}>
            {t('healthProfileLastSaved')}
          </Text>
        </Card>

        {/* B. Medical records */}
        <SectionHeader title={t('recordsTitle')} />
        {loading && !failed ? <LoadingView label={t('loading')} /> : null}

        {failed ? (
          <View style={styles.stateBlock}>
            <InlineAlert variant="danger" title={t('recordsLoadError')} />
            <Button label={t('retry')} variant="secondary" onPress={retry} />
          </View>
        ) : null}

        {visits !== null && !loading && visits.length === 0 ? (
          <View style={styles.stateBlock}>
            <EmptyState
              icon="file-document-outline"
              title={t('recordsEmptyTitle')}
              description={t('recordsEmptyBody')}
            />
            <Card style={styles.card}>
              <InlineAlert variant="info" title={t('recordsBackendNote')} />
            </Card>
          </View>
        ) : null}

        {!loading &&
          visits?.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
      </ScrollView>
    </AppBackground>
  );
}

/** One health-profile category, read-only, with the answered/none distinction. */
function HealthRow({
  label,
  section,
}: {
  label: string;
  section: HealthSection;
}) {
  const { t, isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;

  const value = section.none
    ? t('reviewNoneSection')
    : section.answered
      ? section.entries.map((entry) => entry.label).join(' Â· ')
      : t('reviewEmptySection');

  return (
    <View style={styles.healthRow}>
      <Text style={[styles.rowLabel, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: c.text, textAlign: textAlignment(isRTL) }]}>
        {value}
      </Text>
    </View>
  );
}

function VisitCard({ visit }: { visit: MedicalVisit }) {
  const { t, isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  const rows: { label: string; value: string }[] = [
    { label: t('visitDate'), value: visit.date },
    { label: t('visitReason'), value: visit.reasonForVisit ?? t('recordNotProvided') },
    { label: t('visitDiagnosis'), value: visit.diagnosis ?? t('recordNotProvided') },
    {
      label: t('visitPrescribedMeds'),
      value: visit.prescribedMedications.length
        ? visit.prescribedMedications.join(' Â· ')
        : t('recordNotProvided'),
    },
    {
      label: t('visitLabTests'),
      value: visit.requestedLabTests.length
        ? visit.requestedLabTests.join(' Â· ')
        : t('recordNotProvided'),
    },
    {
      label: t('visitLabResults'),
      value: visit.labResults.length ? visit.labResults.join(' Â· ') : t('recordNotProvided'),
    },
    {
      label: t('visitAttachments'),
      value: visit.attachments.length
        ? visit.attachments.map((file) => file.name).join(' Â· ')
        : t('recordNotProvided'),
    },
    { label: t('visitFollowUp'), value: visit.followUpInstructions ?? t('recordNotProvided') },
    { label: t('visitClinicalNotes'), value: visit.clinicalNotes ?? t('recordNotProvided') },
    { label: t('visitDoctor'), value: visit.doctorName ?? t('recordNotProvided') },
    { label: t('visitSpecialty'), value: visit.specialtyName ?? t('recordNotProvided') },
  ];

  return (
    <Card style={styles.visitCard}>
      <View style={[styles.visitHead, { flexDirection: rowDirection(isRTL) }]}>
        <Text style={[styles.visitTitle, align, { color: c.text }]}>{visit.date}</Text>
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

      <InlineAlert variant="info" title={t('clinicalNoteReadOnly')} />
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
  card: { gap: Spacing.md },
  summary: { ...Typography.sectionTitle },
  hint: { ...Typography.caption },
  list: { gap: Spacing.sm },
  healthRow: { gap: 2, paddingVertical: Spacing.sm },
  rowLabel: { ...Typography.caption, fontWeight: '600' },
  rowValue: { ...Typography.body },
  stateBlock: { gap: Spacing.md },
  visitCard: { gap: Spacing.sm },
  visitHead: { alignItems: 'center' },
  visitTitle: { ...Typography.sectionTitle, flex: 1 },
  detailLine: { gap: 2, paddingVertical: Spacing.sm },
  detailLabel: { ...Typography.caption, fontWeight: '600' },
  detailValue: { ...Typography.body },
});
