import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { DetailHeader } from '@/components/patient/detail-header';
import { HealthEntryEditor } from '@/components/patient/health-entry-editor';
import {
  Button,
  Card,
  InlineAlert,
  SectionHeader,
  TextField,
} from '@/components/ui';
import { Spacing, Typography, textAlignment } from '@/constants/brand';
import type { HealthProfile } from '@/data/types';
import { emptyHealthProfile, isEntryValid } from '@/services/health-profile';
import { useLanguage } from '@/i18n/language-context';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * Editable health profile.
 *
 * The patient edits their own self-reported health information at any time.
 * Every category is editable, entries can be added or removed, and "none" is
 * only ever a recorded answer — an unanswered question is never read as proof
 * that nothing exists.
 *
 * This is deliberately NOT the medical record: nothing here is clinician
 * authored, and the screen never lets the patient rewrite a physician's
 * diagnosis, test result or note.
 */
export default function HealthProfileEditScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { isAuthenticated, profile, saveProfile } = useAuth();
  const c = theme.colors;

  const [draft, setDraft] = useState<HealthProfile>(profile ?? emptyHealthProfile());
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [invalid, setInvalid] = useState(false);

  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  const align = { textAlign: textAlignment(isRTL) } as const;

  // `HealthProfile` mixes five differently-shaped categories, so the patcher is
  // typed loosely here and narrowed by the `sections` table below instead.
  const patch = (key: keyof HealthProfile, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }) as HealthProfile);

  const allEntriesValid = (): boolean =>
    [
      draft.chronicConditions,
      draft.previousSurgeries,
      draft.drugAllergies,
      draft.currentMedications,
    ].every((section) => section.none || section.entries.every(isEntryValid));

  const save = async () => {
    if (pending) return;
    setSaved(false);
    if (!allEntriesValid()) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setPending(true);
    try {
      await saveProfile(draft);
      setSaved(true);
    } catch {
      setInvalid(true);
    } finally {
      setPending(false);
    }
  };

  /** The four category keys of a health profile — `otherNotes` is not a list. */
  type HealthSectionKey = Exclude<keyof HealthProfile, 'otherNotes'>;

  const sections: {
    key: HealthSectionKey;
    title: string;
    body: string;
    nameLabel: string;
    detailLabel: string;
    extraField?: { key: string; label: string };
    addLabel: string;
    noneLabel: string;
  }[] = [
    {
      key: 'chronicConditions',
      title: t('stepConditionsTitle'),
      body: t('stepConditionsBody'),
      nameLabel: t('entryName'),
      detailLabel: t('entryDetail'),
      addLabel: t('addCondition'),
      noneLabel: t('noneConditions'),
    },
    {
      key: 'previousSurgeries',
      title: t('stepSurgeriesTitle'),
      body: t('stepSurgeriesBody'),
      nameLabel: t('entryName'),
      detailLabel: t('entryDetail'),
      extraField: { key: 'when', label: t('entryWhen') },
      addLabel: t('addSurgery'),
      noneLabel: t('noneSurgeries'),
    },
    {
      key: 'drugAllergies',
      title: t('stepAllergiesTitle'),
      body: t('stepAllergiesBody'),
      nameLabel: t('entryName'),
      detailLabel: t('entryDetail'),
      addLabel: t('addAllergy'),
      noneLabel: t('noneAllergies'),
    },
    {
      key: 'currentMedications',
      title: t('stepMedicationsTitle'),
      body: t('stepMedicationsBody'),
      nameLabel: t('entryName'),
      detailLabel: t('entryDetail'),
      extraField: { key: 'dosage', label: t('entryDosage') },
      addLabel: t('addMedication'),
      noneLabel: t('noneLabel'),
    },
  ];

  return (
    <AppBackground>
      <DetailHeader title={t('healthProfileTitle')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <InlineAlert
          variant="info"
          title={t('healthProfileSubtitle')}
          description={t('healthProfileLastSaved')}
        />

        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            <SectionHeader title={section.title} />
            <Card style={styles.card}>
              <Text style={[styles.body, align, { color: c.textSecondary }]}>
                {section.body}
              </Text>
              <HealthEntryEditor
                section={draft[section.key]}
                onChange={(next) => patch(section.key, next)}
                nameLabel={section.nameLabel}
                detailLabel={section.detailLabel}
                extraField={section.extraField}
                addLabel={section.addLabel}
                noneLabel={section.noneLabel}
                noneHint={t('noneHint')}
                disabled={pending}
              />
            </Card>
          </View>
        ))}

        <SectionHeader title={t('stepOtherTitle')} />
        <Card style={styles.card}>
          <Text style={[styles.body, align, { color: c.textSecondary }]}>
            {t('stepOtherBody')}
          </Text>
          <TextField
            label={t('otherNotesLabel')}
            placeholder={t('otherNotesPlaceholder')}
            value={draft.otherNotes}
            onChangeText={(value) => patch('otherNotes', value)}
            multiline
            disabled={pending}
          />
        </Card>

        {invalid ? (
          <InlineAlert
            variant="danger"
            title={t('hpEntryRequired')}
            description={t('hpRemoveEntryBody')}
          />
        ) : null}
        {saved ? <InlineAlert variant="success" title={t('hpSaved')} /> : null}

        <View style={styles.actions}>
          <Button
            label={t('hpSave')}
            onPress={save}
            loading={pending}
            disabled={pending}
            fullWidth
          />
          <Button
            label={t('editProfileCancel')}
            variant="ghost"
            onPress={() => router.back()}
            disabled={pending}
            fullWidth
          />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  section: { gap: Spacing.sm },
  card: { gap: Spacing.md },
  body: { ...Typography.secondary },
  actions: { gap: Spacing.sm },
});
