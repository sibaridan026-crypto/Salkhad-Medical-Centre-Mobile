import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { DoctorCard } from '@/components/doctor-card';
import { DetailHeader } from '@/components/patient/detail-header';
import { Button, EmptyState, InlineAlert, LoadingView } from '@/components/ui';
import { Colors, Radius, Spacing, Typography, textAlignment } from '@/constants/brand';
import { SPECIALTY_IMAGES } from '@/data/specialty-visuals';
import { useLanguage } from '@/i18n/language-context';
import { getSpecialtyById, specialtyCoverImage } from '@/services/specialties';
import { listDoctors } from '@/services/doctors';
import { useTheme } from '@/theme';

/** One specialty and its doctors from the backend API. */
export default function SpecialtyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, lang, isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  if (!id) return <Redirect href="/patient/specialties" />;

  const [specialty, setSpecialty] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [specialtyResult, doctorsResult] = await Promise.all([
          getSpecialtyById(id, lang),
          listDoctors(id, lang),
        ]);
        if (cancelled) return;
        if (specialtyResult.ok) setSpecialty(specialtyResult.value);
        if (doctorsResult.ok) setDoctors(doctorsResult.value);
        if (!specialtyResult.ok || !doctorsResult.ok) setFailed(true);
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

  const local = specialty ? specialtyCoverImage(specialty) : null;

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <DetailHeader title={specialty ? (lang === 'ar' && specialty.nameAr ? specialty.nameAr : specialty.name) : t('loading')} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading && !failed ? <LoadingView label={t('loading')} /> : null}

          {failed ? (
            <View style={styles.stateBlock}>
              <InlineAlert variant="danger" title={t('backendPending')} />
              <Button label={t('retry')} variant="secondary" onPress={retry} />
            </View>
          ) : null}

          {!loading && specialty ? (
            <>
              <Image
                source={local as any}
                style={styles.cover}
                resizeMode="cover"
              />
              <Text style={[styles.name, align]}>{specialty.name || ''}</Text>
              <Text style={[styles.description, align]}>
                {specialty.description?.ar || specialty.description?.en || ''}
              </Text>

              <Text style={[styles.sectionTitle, align]}>{t('specialtyDoctorsTitle')}</Text>

              {doctors !== null && doctors.length === 0 ? (
                <EmptyState icon="account-search-outline" title={t('specialtyNoDoctors')} />
              ) : (
                <View style={styles.list}>
                  {(doctors ?? []).map((doctor: any) => (
                    <DoctorCard
                      key={doctor.id}
                      name={doctor.fullName}
                      specialty={doctor.specialtyName ?? doctor.specialtyNameAr ?? ''}
                      photo={undefined}
                      onPress={() => router.push(`/patient/doctors/${doctor.id}`)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  cover: {
    width: '100%',
    height: 170,
    borderRadius: Radius.lg,
    backgroundColor: Colors.lavender,
  },
  name: { ...Typography.screenTitle, color: Colors.text },
  description: { ...Typography.body, color: Colors.textSecondary },
  sectionTitle: { ...Typography.sectionTitle, color: Colors.text, marginTop: Spacing.sm },
  list: { gap: Spacing.md },
  stateBlock: { gap: Spacing.md },
});
