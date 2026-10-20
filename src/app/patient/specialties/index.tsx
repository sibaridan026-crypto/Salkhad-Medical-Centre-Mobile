import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PatientScreen } from '@/components/patient/patient-screen';
import { SpecialtyCoverCard } from '@/components/patient/specialty-cover-card';
import { Button, InlineAlert } from '@/components/ui';
import { Colors, Spacing, Typography, textAlignment } from '@/constants/brand';
import { SPECIALTY_IMAGES } from '@/data/specialty-visuals';
import { useLanguage } from '@/i18n/language-context';
import { listSpecialties, specialtyCoverImage } from '@/services/specialties';

/** All specialties from the backend API. Local images matched by name. */
export default function SpecialtiesScreen() {
  const router = useRouter();
  const { strings, lang, isRTL } = useLanguage();
  const align = { textAlign: textAlignment(isRTL) } as const;

  const [data, setData] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await listSpecialties(lang);
        if (cancelled) return;
        if (result.ok) setData(result.value);
        else setFailed(true);
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
  }, [reloadKey, lang]);

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  return (
    <PatientScreen activeTab="specialties">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={[styles.title, align]}>{strings.specialtiesTitle}</Text>
          <Text style={[styles.subtitle, align]}>{strings.specialtiesSubtitle}</Text>
        </View>

        {failed ? (
          <View style={styles.stateBlock}>
            <InlineAlert variant="danger" title={strings.backendPending} />
            <Button label={strings.retry} variant="secondary" onPress={retry} />
          </View>
        ) : null}

        {data !== null && !loading && data.length === 0 ? (
          <View style={styles.stateBlock}>
            <InlineAlert variant="info" title={strings.noSpecialtiesFound} />
          </View>
        ) : null}

        {!loading &&
          data?.map((specialty: any, key: number) => {
            const local = specialtyCoverImage(specialty);
            const name = lang === 'ar' && specialty.nameAr ? specialty.nameAr : specialty.name;
            return (
              <SpecialtyCoverCard
                key={key}
                name={name}
                description={name}
                image={local as any}
                doctorsLabel={`${specialty.doctorCount} ${strings.doctorsCount}`}
                onPress={() => router.push(`/patient/specialties/${specialty.id}`)}
              />
            );
          })}
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
  heading: { gap: 2 },
  title: { ...Typography.screenTitle, color: Colors.text },
  subtitle: { ...Typography.secondary, color: Colors.textSecondary },
  stateBlock: { gap: Spacing.md },
});
