/**
 * Health-profile service — the patient's own health information.
 *
 * CURRENT STATE: MOCK, LOCAL ONLY.
 *
 * The profile is self-reported and optional. It is kept for the lifetime of the
 * process (see `services/storage.ts`) and is NOT written to disk and NOT sent
 * anywhere, because there is no backend in this phase. This module is the
 * single seam a real, consent-gated API will replace: the screens read and
 * write only through these functions.
 *
 * The profile is strictly separate from both the personal (account) profile and
 * the clinician-authored medical record. Patient-reported medications live HERE;
 * physician prescriptions belong to `services/prescriptions.ts`.
 */

import type {
  Gender,
  HealthEntry,
  HealthProfile,
  HealthSection,
  MedicationEntry,
  SurgeryEntry,
} from '@/data/types';
import { readJson, StorageKeys, writeJson } from './storage';

export type {
  HealthEntry,
  HealthProfile,
  HealthSection,
  MedicationEntry,
  SurgeryEntry,
};

/**
 * An explicitly empty section. `answered` stays `false` so the UI can tell
 * "the patient answered: none" apart from "the patient has not answered yet" —
 * an unanswered question is never read as proof that nothing exists.
 */
export function emptySection<TEntry extends HealthEntry>(): HealthSection<TEntry> {
  return { entries: [], none: false, answered: false };
}

export function emptyHealthProfile(): HealthProfile {
  return {
    chronicConditions: emptySection(),
    previousSurgeries: emptySection(),
    drugAllergies: emptySection(),
    currentMedications: emptySection(),
    otherNotes: '',
  };
}

let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

export const newEntryId = (prefix: string) => nextId(prefix);

/**
 * A new, fully-shaped entry.
 *
 * Every field declared by `HealthEntry` is present and empty. A brand-new entry
 * must never be a partial object: a missing `label` used to reach
 * `entry.label.trim()` as `undefined` and crashed the wizard, so the shape is
 * built here once instead of being cast into place at each call site.
 *
 * `extraKey` adds the optional category field (`when` for surgeries, `dosage`
 * for medications) with the same guarantee.
 */
export function createEntry(extraKey?: string): HealthEntry {
  const base: HealthEntry = { id: newEntryId('entry'), label: '', detail: '' };
  return extraKey ? { ...base, [extraKey]: '' } : base;
}

/**
 * Validates one entry: the label is the only required part.
 *
 * Defensive by design — a missing, null, non-string or whitespace-only value is
 * reported as invalid instead of throwing, because entries can also arrive from
 * storage written by an older build.
 */
export function isEntryValid(entry: HealthEntry | null | undefined): boolean {
  const label = entry && typeof entry.label === 'string' ? entry.label.trim() : '';
  return label.length > 0;
}

/** Reads a string field from an entry without ever returning a non-string. */
export function entryText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Reads the stored profile, or an explicitly empty one. Never throws, and never
 * invents data: an absent profile is indistinguishable from "not answered yet",
 * which is the honest reading.
 */
export async function loadHealthProfile(): Promise<HealthProfile | null> {
  const stored = await readJson<HealthProfile>(StorageKeys.healthProfile);
  if (!stored) return null;
  return normalize(stored);
}

/** Fills in any field an older stored value is missing, without inventing data. */
function normalize(profile: HealthProfile): HealthProfile {
  const fallback = emptyHealthProfile();
  return {
    chronicConditions: profile.chronicConditions ?? fallback.chronicConditions,
    previousSurgeries: profile.previousSurgeries ?? fallback.previousSurgeries,
    drugAllergies: profile.drugAllergies ?? fallback.drugAllergies,
    currentMedications: profile.currentMedications ?? fallback.currentMedications,
    otherNotes: typeof profile.otherNotes === 'string' ? profile.otherNotes : '',
  };
}

/**
 * "Saves" the profile locally. In this mock it stays in memory only; a real
 * implementation persists it against explicit patient consent and calls the
 * health-profile API. Returns the stored value so callers can render it.
 */
export async function saveHealthProfile(
  profile: HealthProfile,
): Promise<HealthProfile> {
  await writeJson(StorageKeys.healthProfile, profile);
  return profile;
}

/**
 * True when at least one section has been answered and no section is left with
 * an unanswered, unanswered-looking state that would make the saved profile
 * ambiguous. Used to decide whether "completed" is an honest label.
 */
export function hasAnyAnswer(profile: HealthProfile): boolean {
  const sections: readonly HealthSection<HealthEntry>[] = [
    profile.chronicConditions,
    profile.previousSurgeries,
    profile.drugAllergies,
    profile.currentMedications,
  ];
  return (
    sections.some((section) => section.answered) || profile.otherNotes.trim().length > 0
  );
}

/** The number of answered categories, shown on the health-profile entry row. */
export function answeredCount(profile: HealthProfile): number {
  return [
    profile.chronicConditions,
    profile.previousSurgeries,
    profile.drugAllergies,
    profile.currentMedications,
  ].filter((section) => section.answered).length;
}

/* -------------------------------------------------------------------------- */
/* Onboarding state                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Explicit onboarding state. `pending` means the initial health-profile
 * onboarding has never been completed or skipped; `skipped` and `completed`
 * both mean "do not show it again". Keeping `skipped` distinct from `pending`
 * is what stops the onboarding from reappearing after a skip.
 */
export type OnboardingState = 'pending' | 'completed' | 'skipped';

export async function loadOnboardingState(): Promise<OnboardingState> {
  const stored = await readJson<OnboardingState>(StorageKeys.onboarding);
  return stored === 'completed' || stored === 'skipped' ? stored : 'pending';
}

export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  await writeJson(StorageKeys.onboarding, state);
}

/* -------------------------------------------------------------------------- */
/* Shared formatting helpers                                                  */
/* -------------------------------------------------------------------------- */

export function formatGender(gender: Gender | null, locale: 'ar' | 'en'): string {
  if (gender === 'male') return locale === 'ar' ? 'ذكر' : 'Male';
  if (gender === 'female') return locale === 'ar' ? 'أنثى' : 'Female';
  return '—';
}

/** ISO `YYYY-MM-DD` → localised `DD/MM/YYYY` (or `MM/DD/YYYY` in English). */
export function formatIsoDate(iso: string, locale: 'ar' | 'en'): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return locale === 'ar' ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
}
