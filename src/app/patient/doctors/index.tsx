import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DoctorCard } from '@/components/doctor-card';
import { PatientScreen } from '@/components/patient/patient-screen';
import { Chip, EmptyState, InlineAlert, LoadingView, TextField, Button } from '@/components/ui';
import { Colors, Spacing, Typography, textAlignment } from '@/constants/brand';
import { SPECIALTIES } from '@/data/specialties';
import { useLanguage } from '@/i18n/language-context';
import { localize } from '@/lib/doctor';
import { listDoctors } from '@/services/doctors';

/** Doctors from the backend API with name search and specialty filter. */
export default function DoctorsScreen() {
  const router = useRouter();
  const { strings, lang, isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [specialtyId, setSpecialtyId] = useState<string>('all');

  const align = { textAlign: textAlignment(isRTL) } as const;

  const [data, setData] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await listDoctors(specialtyId === 'all' ? null : specialtyId, lang);
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
  }, [reloadKey, specialtyId, lang]);

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  const results = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.filter((doctor: any) => {
      if (!needle) return true;
      return doctor.fullName.toLowerCase().includes(needle);
    });
  }, [data, query]);

  return (
    <PatientScreen activeTab="doctors">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, align]}>{strings.doctorsTitle}</Text>

        <TextField
          placeholder={strings.doctorsSearchPlaceholder}
          value={query}
          onChangeText={setQuery}
          leadingIcon="magnify"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Chip
            label={strings.filterAll}
            selected={specialtyId === 'all'}
            onPress={() => setSpecialtyId('all')}
          />
          {SPECIALTIES.map((specialty) => (
            <Chip
              key={specialty.id}
              label={localize(specialty.name, lang)}
              selected={specialtyId === specialty.id}
              onPress={() => setSpecialtyId(specialty.id)}
            />
          ))}
        </ScrollView>

        {loading && !failed ? <LoadingView label={strings.loading} /> : null}

        {failed ? (
          <View style={styles.stateBlock}>
            <InlineAlert variant="danger" title={strings.backendPending} />
            <Button label={strings.retry} variant="secondary" onPress={retry} />
          </View>
        ) : null}

        {results.length === 0 && !loading && !failed ? (
          <EmptyState icon="account-search-outline" title={strings.noDoctorsFound} />
        ) : null}

        {!loading && !failed && results.length > 0 ? (
          <View style={styles.list}>
            {results.map((doctor: any) => {
              const name = doctor.fullName;
              return (
                <DoctorCard
                  key={doctor.id}
                  name={name}
                  specialty={doctor.specialtyName ?? doctor.specialtyNameAr ?? ''}
                  photo={undefined}
                  onPress={() => router.push(`/patient/doctors/${doctor.id}`)}
                />
              );
            })}
          </View>
        ) : null}
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
  title: { ...Typography.screenTitle, color: Colors.text },
  filters: { gap: Spacing.sm, paddingVertical: 2 },
  list: { gap: Spacing.md },
  stateBlock: { gap: Spacing.md },
});
