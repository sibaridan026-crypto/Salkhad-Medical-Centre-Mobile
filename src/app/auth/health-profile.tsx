import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/components/patient/auth-shell';
import { HealthEntryEditor } from '@/components/patient/health-entry-editor';
import { Button, Card, InlineAlert, ProgressSteps, TextField } from '@/components/ui';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import {
  isEntryValid,
  entryText,
  type HealthSection,
  type HealthEntry,
  emptyHealthProfile,
} from '@/services/health-profile';
import type { HealthProfile } from '@/data/types';
import { useLanguage } from '@/i18n/language-context';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * Initial health-profile onboarding.
 *
 * Five short steps plus a review step, instead of one long form. Every answer
 * the patient types is kept while they move between steps, and going back never
 * discards it.
 *
 * Honesty rules built into this screen:
 *   - Ticking "none" is the only way a section can be recorded as empty; an
 *     unanswered section stays unanswered rather than being read as a negative.
 *   - The final review states plainly which sections were not answered.
 *   - "Skip for now" is a permanent answer for this install, so a returning
 *     patient is never shown this flow again.
 *   - Nothing here is sent anywhere: the profile is stored on the device only.
 */
export default function HealthProfileScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, profile, completeOnboarding, skipOnboarding } = useAuth();
  const router = useRouter();

  const [draft, setDraft] = useState<HealthProfile>(profile ?? emptyHealthProfile());
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState(false);

  if (!isAuthenticated) return <AuthRedirect />;

  const align = { textAlign: textAlignment(isRTL) } as const;
  const c = theme.colors;

  const steps = [
    t('stepConditionsTitle'),
    t('stepSurgeriesTitle'),
    t('stepAllergiesTitle'),
    t('stepMedicationsTitle'),
    t('stepOtherTitle'),
    t('reviewTitle'),
  ];

  const patch = <K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /** A step may only be left when its entries are valid. */
  const stepIsValid = (): boolean => {
    switch (step) {
      case 0:
        return draft.chronicConditions.none || draft.chronicConditions.entries.every(isEntryValid);
      case 1:
        return draft.previousSurgeries.none || draft.previousSurgeries.entries.every(isEntryValid);
      case 2:
        return draft.drugAllergies.none || draft.drugAllergies.entries.every(isEntryValid);
      case 3:
        return (
          draft.currentMedications.none ||
          draft.currentMedications.entries.every(isEntryValid)
        );
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!stepIsValid()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const save = async () => {
    if (pending) return;
    setPending(true);
    setSaveError(false);
    try {
      await completeOnboarding(draft);
      router.replace('/patient');
    } catch {
      setSaveError(true);
    } finally {
      setPending(false);
    }
  };

  const skip = async () => {
    if (pending) return;
    setPending(true);
    setSaveError(false);
    try {
      await skipOnboarding();
      router.replace('/patient');
    } catch {
      setSaveError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title={t('healthTitle')}
      subtitle={t('healthSubtitle')}
      footer={
        <Button
          label={t('skipForNow')}
          variant="ghost"
          size="sm"
          loading={pending && step === steps.length - 1}
          disabled={pending}
          onPress={skip}
        />
      }
    >
      <Card style={styles.card}>
        <ProgressSteps steps={steps} current={step} />

        <Text style={[styles.progress, align, { color: c.textMuted }]}>
          {t('stepOf').replace('{current}', String(step + 1)).replace('{total}', String(steps.length))}
        </Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {step === 0 ? (
            <StepBody
              title={t('stepConditionsTitle')}
              body={t('stepConditionsBody')}
              section={draft.chronicConditions}
              onChange={(next) => patch('chronicConditions', next)}
              nameLabel={t('entryName')}
              detailLabel={t('entryDetail')}
              addLabel={t('addCondition')}
              noneLabel={t('noneConditions')}
              noneHint={t('noneHint')}
            />
          ) : null}

          {step === 1 ? (
            <StepBody
              title={t('stepSurgeriesTitle')}
              body={t('stepSurgeriesBody')}
              section={draft.previousSurgeries}
              onChange={(next) => patch('previousSurgeries', next)}
              nameLabel={t('entryName')}
              detailLabel={t('entryDetail')}
              extraField={{ key: 'when', label: t('entryWhen') }}
              addLabel={t('addSurgery')}
              noneLabel={t('noneSurgeries')}
              noneHint={t('noneHint')}
            />
          ) : null}

          {step === 2 ? (
            <StepBody
              title={t('stepAllergiesTitle')}
              body={t('stepAllergiesBody')}
              section={draft.drugAllergies}
              onChange={(next) => patch('drugAllergies', next)}
              nameLabel={t('entryName')}
              detailLabel={t('entryDetail')}
              addLabel={t('addAllergy')}
              noneLabel={t('noneAllergies')}
              noneHint={t('noneHint')}
            />
          ) : null}

          {step === 3 ? (
            <StepBody
              title={t('stepMedicationsTitle')}
              body={t('stepMedicationsBody')}
              section={draft.currentMedications}
              onChange={(next) => patch('currentMedications', next)}
              nameLabel={t('entryName')}
              detailLabel={t('entryDetail')}
              extraField={{ key: 'dosage', label: t('entryDosage') }}
              addLabel={t('addMedication')}
              noneLabel={t('noneLabel')}
              noneHint={t('noneHint')}
            />
          ) : null}

          {step === 4 ? (
            <View style={styles.stepBlock}>
              <Text style={[styles.stepTitle, align, { color: c.text }]}>
                {t('stepOtherTitle')}
              </Text>
              <Text style={[styles.stepBody, align, { color: c.textSecondary }]}>
                {t('stepOtherBody')}
              </Text>
              <TextField
                label={t('otherNotesLabel')}
                placeholder={t('otherNotesPlaceholder')}
                value={draft.otherNotes}
                onChangeText={(text) => patch('otherNotes', text)}
                multiline
              />
            </View>
          ) : null}

          {step === 5 ? (
            <Review draft={draft} onEditStep={(index) => setStep(index)} />
          ) : null}
        </ScrollView>

        {saveError ? (
          <InlineAlert variant="danger" title={t('backendPending')} />
        ) : null}

        <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {step > 0 ? (
            <Button label={t('previous')} variant="secondary" onPress={goBack} disabled={pending} />
          ) : null}

          {step < steps.length - 1 ? (
            <Button
              label={t('continue')}
              onPress={goNext}
              disabled={!stepIsValid() || pending}
              fullWidth={step === 0}
            />
          ) : (
            <Button
              label={t('finishAndSave')}
              onPress={save}
              loading={pending}
              disabled={pending}
              fullWidth
            />
          )}
        </View>

        {step === 0 ? (
          <Text style={[styles.footnote, align, { color: c.textMuted }]}>
            {t('stepPreserved')}
          </Text>
        ) : null}
      </Card>
    </AuthShell>
  );
}

function AuthRedirect() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <AuthShell title={t('loginTitle')}>
      <InlineAlert variant="info" title={t('authLocalNote')} />
      <Button label={t('goLogin')} fullWidth onPress={() => router.replace('/auth/login')} />
    </AuthShell>
  );
}

function StepBody<TEntry extends { id: string; label: string; detail: string }>({
  title,
  body,
  section,
  onChange,
  ...editor
}: {
  title: string;
  body: string;
  section: HealthSection<TEntry>;
  onChange: (next: HealthSection<TEntry>) => void;
  nameLabel: string;
  detailLabel: string;
  extraField?: { key: string; label: string };
  addLabel: string;
  noneLabel: string;
  noneHint: string;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  return (
    <View style={styles.stepBlock}>
      <Text style={[styles.stepTitle, align, { color: c.text }]}>{title}</Text>
      <Text style={[styles.stepBody, align, { color: c.textSecondary }]}>{body}</Text>
      <HealthEntryEditor section={section} onChange={onChange} {...editor} />
    </View>
  );
}

/** Final review: every answered value, and an honest note for what was not. */
function Review({
  draft,
  onEditStep,
}: {
  draft: HealthProfile;
  onEditStep: (index: number) => void;
}) {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  const noneLabel = t('reviewNoneSection');

  const rows: { label: string; lines: readonly string[]; step: number }[] = [
    { label: t('reviewConditions'), lines: sectionLines(draft.chronicConditions, noneLabel), step: 0 },
    {
      label: t('reviewSurgeries'),
      lines: sectionLines(draft.previousSurgeries, noneLabel),
      step: 1,
    },
    { label: t('reviewAllergies'), lines: sectionLines(draft.drugAllergies, noneLabel), step: 2 },
    {
      label: t('reviewMedications'),
      lines: sectionLines(draft.currentMedications, noneLabel),
      step: 3,
    },
  ];

  const otherLines = draft.otherNotes.trim() ? [draft.otherNotes.trim()] : [];

  return (
    <View style={styles.stepBlock}>
      <Text style={[styles.stepTitle, align, { color: c.text }]}>{t('reviewTitle')}</Text>
      <Text style={[styles.stepBody, align, { color: c.textSecondary }]}>{t('reviewSubtitle')}</Text>

      {rows.map((row) => (
        <View key={row.label} style={[styles.reviewRow, { borderColor: c.border }]}>
          <View style={[styles.reviewHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.reviewLabel, align, { color: c.text }]}>{row.label}</Text>
            <Button
              label={t('edit')}
              variant="ghost"
              size="sm"
              onPress={() => onEditStep(row.step)}
            />
          </View>
          {row.lines.length === 0 ? (
            <Text style={[styles.reviewEmpty, align, { color: c.textMuted }]}>
              {sectionIsNone(draft, row.step)
                ? t('reviewNoneSection')
                : t('reviewEmptySection')}
            </Text>
          ) : (
            <View style={styles.reviewLines}>
              {row.lines.map((line, index) => (
                <Text key={`${row.label}-${index}`} style={[styles.reviewLine, align, { color: c.textSecondary }]}>
                  • {line}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={[styles.reviewRow, { borderColor: c.border }]}>
        <View style={[styles.reviewHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.reviewLabel, align, { color: c.text }]}>{t('reviewOther')}</Text>
          <Button label={t('edit')} variant="ghost" size="sm" onPress={() => onEditStep(4)} />
        </View>
        {otherLines.length === 0 ? (
          <Text style={[styles.reviewEmpty, align, { color: c.textMuted }]}>
            {t('reviewEmptySection')}
          </Text>
        ) : (
          <Text style={[styles.reviewLine, align, { color: c.textSecondary }]}>
            • {otherLines[0]}
          </Text>
        )}
      </View>

      <InlineAlert variant="info" title={t('healthSavedNote')} description={t('saveLaterNote')} />
    </View>
  );
}

function sectionIsNone(draft: HealthProfile, step: number): boolean {
  if (step === 0) return draft.chronicConditions.none;
  if (step === 1) return draft.previousSurgeries.none;
  if (step === 2) return draft.drugAllergies.none;
  if (step === 3) return draft.currentMedications.none;
  return false;
}

function sectionLines(
  section: {
    none: boolean;
    answered: boolean;
    entries: readonly { label?: string; detail?: string }[];
  },
  noneLabel: string,
): string[] {
  if (section.none) return [noneLabel];
  return section.entries
    .filter((entry) => isEntryValid(entry as HealthEntry))
    .map((entry) => {
      const label = entryText(entry.label);
      const detail = entryText(entry.detail).trim();
      return detail ? `${label} — ${detail}` : label;
    });
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, paddingVertical: Spacing.lg },
  progress: { ...Typography.caption },
  scroll: { maxHeight: 460 },
  scrollContent: { gap: Spacing.md, paddingBottom: Spacing.sm },
  stepBlock: { gap: Spacing.sm },
  stepTitle: { ...Typography.sectionTitle },
  stepBody: { ...Typography.secondary },
  actions: { gap: Spacing.sm, alignItems: 'center' },
  footnote: { ...Typography.caption },
  reviewRow: { borderWidth: 1, borderRadius: 14, padding: Spacing.md, gap: Spacing.xs },
  reviewHead: { alignItems: 'center', gap: Spacing.sm },
  reviewLabel: { ...Typography.bodyStrong, flex: 1 },
  reviewLines: { gap: 2 },
  reviewLine: { ...Typography.caption },
  reviewEmpty: { ...Typography.caption },
});
