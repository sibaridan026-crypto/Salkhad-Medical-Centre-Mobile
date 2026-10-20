import { DOCTORS } from '@/data/doctors';
import { SPECIALTIES } from '@/data/specialties';
import { DAYS } from '@/data/days';
import type { Doctor, Locale, LocalizedText, ScheduleDay, ScheduleSlot, Specialty } from '@/data/types';

/** Resolves a localized string for the active locale. */
export function localize(text: LocalizedText, locale: Locale): string {
  return locale === 'ar' ? text.ar : text.en;
}

export const SPECIALTY_BY_ID: ReadonlyMap<string, Specialty> = new Map(
  SPECIALTIES.map((specialty) => [specialty.id, specialty]),
);

export const DOCTOR_BY_ID: ReadonlyMap<string, Doctor> = new Map(
  DOCTORS.map((doctor) => [doctor.id, doctor]),
);

/** Number of supplied doctors per specialty — calculated, never hardcoded. */
export const DOCTOR_COUNT_BY_SPECIALTY: ReadonlyMap<string, number> = DOCTORS.reduce(
  (counts, doctor) => {
    counts.set(doctor.specialtyId, (counts.get(doctor.specialtyId) ?? 0) + 1);
    return counts;
  },
  new Map<string, number>(),
);

export function getSpecialty(specialtyId: string): Specialty | undefined {
  return SPECIALTY_BY_ID.get(specialtyId);
}

export function getDoctor(doctorId: string): Doctor | undefined {
  return DOCTOR_BY_ID.get(doctorId);
}

/** Doctors belonging to one specialty, in the supplied order. */
export function doctorsBySpecialty(specialtyId: string): Doctor[] {
  return DOCTORS.filter((doctor) => doctor.specialtyId === specialtyId);
}

/** Groups a doctor's supplied slots by day, keeping the supplied week order. */
export function groupSlotsByDay(slots: readonly ScheduleSlot[]): ScheduleSlot[] {
  const grouped: ScheduleSlot[] = [];

  for (const day of DAYS) {
    for (const slot of slots) {
      if (slot.day === day) {
        grouped.push(slot);
      }
    }
  }

  return grouped;
}

export function scheduleDays(slots: readonly ScheduleSlot[]): ScheduleDay[] {
  return DAYS.filter((day) => slots.some((slot) => slot.day === day));
}

/**
 * The doctor's display name. The honorific is only added when the supplied
 * data marked the entry as a doctor — it is never invented.
 */
export function doctorDisplayName(doctor: Doctor, locale: Locale): string {
  const name = localize(doctor.name, locale);
  if (!doctor.honorific) return name;
  return locale === 'ar' ? `د. ${name}` : `Dr. ${name}`;
}
