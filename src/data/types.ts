/**
 * Data types for the mobile patient UI.
 *
 * These mirror the centre's real scheduling data that already exists in the
 * project's web data layer. Nothing medical is invented here: the shapes only
 * describe what the centre actually supplied.
 *
 * The three patient data domains are deliberately kept apart in the type
 * system, not just in the UI:
 *
 *   A. `PatientAccount`  — account information (name, phone, email, birth
 *      date, gender). Editable by the patient.
 *   B. `HealthProfile`   — self-reported health information (chronic
 *      conditions, surgeries, allergies, patient-reported medications, other
 *      notes). Editable by the patient.
 *   C. Medical-record types (`MedicalVisit`, `Prescription`, …) — information
 *      produced by medical care. Read-only for the patient.
 *
 * Merging them would let patient-entered notes masquerade as clinician records,
 * so no screen is allowed to read one type as another.
 */

export type Locale = 'ar' | 'en';

export interface LocalizedText {
  readonly ar: string;
  readonly en: string;
}

export type SpecialtyIconName =
  | 'neurosurgery'
  | 'pediatrics'
  | 'obstetrics'
  | 'cardiology'
  | 'ent'
  | 'physiotherapy'
  | 'urology'
  | 'orthopedics'
  | 'general-surgery'
  | 'endocrinology'
  | 'dermatology'
  | 'gastroenterology'
  | 'rheumatology'
  | 'psychiatry';

export interface Specialty {
  readonly id: string;
  /** Original icon key from the centre's data (kept verbatim). */
  readonly icon: SpecialtyIconName;
  readonly name: LocalizedText;
  readonly description: LocalizedText;
}

export type ScheduleDay =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday';

export interface ScheduleSlot {
  readonly day: ScheduleDay;
  /** 24h `HH:MM`. `null` when the source data supplied no end time. */
  readonly from: string;
  readonly to: string | null;
}

export interface Doctor {
  readonly id: string;
  readonly name: LocalizedText;
  /** Whether the supplied name carries a doctor honorific (`د.` / `Dr.`). */
  readonly honorific: boolean;
  readonly specialtyId: string;
  readonly credential: LocalizedText | null;
  /**
   * Extra documented clinical areas supplied by the centre, shown in addition
   * to the main specialty. Omitted entirely when the centre supplied none.
   */
  readonly focusAreas?: LocalizedText;
  readonly schedule: readonly ScheduleSlot[];
}

export interface ContactDetails {
  readonly landline: string;
  readonly mobile: string;
  readonly whatsapp: string;
  readonly whatsappInternational: string;
  readonly address: LocalizedText;
}

/* -------------------------------------------------------------------------- */
/* A. Personal profile (account)                                              */
/* -------------------------------------------------------------------------- */

export type Gender = 'male' | 'female';

/**
 * Account information only. No medical field may ever be added here — medical
 * information lives in `HealthProfile` (patient-authored) or in the
 * medical-record types (clinician-authored).
 */
export interface PatientAccount {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string;
  /** Optional at registration; never validated as required. */
  readonly email: string | null;
  /** ISO `YYYY-MM-DD`. Required at registration. */
  readonly dateOfBirth: string | null;
  readonly gender: Gender | null;
}

/* -------------------------------------------------------------------------- */
/* B. Health profile (patient-maintained)                                     */
/* -------------------------------------------------------------------------- */

/**
 * One patient-reported entry. `none` marks an explicit "I have none of these"
 * answer, which is NOT the same as leaving a question unanswered: an empty
 * entry list with `answered: false` means "the patient has not answered yet".
 */
export interface HealthEntry {
  readonly id: string;
  readonly label: string;
  /** Free detail supplied by the patient (dosage, date, notes, …). */
  readonly detail: string;
}

export interface HealthSection<TEntry extends HealthEntry = HealthEntry> {
  readonly entries: readonly TEntry[];
  /** True only when the patient explicitly ticked "none". */
  readonly none: boolean;
  /** True once the patient has answered this section at least once. */
  readonly answered: boolean;
}

export interface SurgeryEntry extends HealthEntry {
  /** Optional ISO `YYYY-MM-DD` or free text the patient remembers. */
  readonly when: string;
}

export interface MedicationEntry extends HealthEntry {
  /** Optional dosage / frequency the patient remembers. */
  readonly dosage: string;
}

/**
 * The patient's self-reported health details.
 *
 * Patient-reported medications live here. Physician-prescribed medications do
 * NOT — they are medical-record data (see `Prescription`).
 */
export interface HealthProfile {
  readonly chronicConditions: HealthSection;
  readonly previousSurgeries: HealthSection<SurgeryEntry>;
  readonly drugAllergies: HealthSection;
  readonly currentMedications: HealthSection<MedicationEntry>;
  readonly otherNotes: string;
}

/* -------------------------------------------------------------------------- */
/* C. Medical record (clinician-authored, read-only for the patient)          */
/* -------------------------------------------------------------------------- */

export type RecordAvailability = 'available' | 'absent' | 'unknown';

export interface MedicalVisit {
  readonly id: string;
  /** ISO `YYYY-MM-DD`. */
  readonly date: string;
  readonly reasonForVisit: string | null;
  readonly diagnosis: string | null;
  readonly prescribedMedications: readonly string[];
  readonly requestedLabTests: readonly string[];
  readonly labResults: readonly string[];
  readonly attachments: readonly MedicalAttachment[];
  readonly followUpInstructions: string | null;
  readonly clinicalNotes: string | null;
  readonly doctorName: string | null;
  readonly specialtyName: string | null;
}

export interface MedicalAttachment {
  readonly id: string;
  readonly name: string;
  /** `remote` when the file is fetched from the record service. */
  readonly kind: 'report' | 'image';
  readonly url: string | null;
}

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled' | 'unknown';

/** Physician-prescribed medication. Never mixed with `HealthProfile`. */
export interface Prescription {
  readonly id: string;
  readonly medicationName: string;
  readonly dosage: string | null;
  /** Number of doses or frequency, as written by the prescriber. */
  readonly frequency: string | null;
  /** Timing relative to meals, as written by the prescriber. */
  readonly timing: string | null;
  readonly duration: string | null;
  readonly instructions: string | null;
  readonly visitId: string | null;
  readonly prescribingDoctor: string | null;
  /** ISO `YYYY-MM-DD` when supplied. */
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly status: PrescriptionStatus;
}

/* -------------------------------------------------------------------------- */
/* Appointments                                                               */
/* -------------------------------------------------------------------------- */

export type AppointmentStatus =
  | 'upcoming'
  | 'previous'
  | 'cancelled'
  | 'rejected';

export interface Appointment {
  readonly id: string;
  /** Booking reference; `null` until a backend issues one. */
  readonly reference: string | null;
  readonly doctorId: string;
  /** Doctor name from the backend (may be null for patient-created records). */
  readonly doctorName: string | null;
  /**
   * Patient name for the doctor/admin demo views. Demo data is fictional and
   * must never be presented as a real centre record.
   */
  readonly patientName?: string | null;
  /** Patient phone for the doctor/admin demo views, or null when unknown. */
  readonly patientPhone?: string | null;
  readonly specialtyId: string;
  /** Specialty name from the backend. */
  readonly specialtyName: string | null;
  /** Specialty name in Arabic from the backend. */
  readonly specialtyNameAr: string | null;
  /** ISO `YYYY-MM-DD` of the booked day. */
  readonly date: string;
  /** 24h `HH:MM`. */
  readonly timeFrom: string;
  readonly timeTo: string | null;
  readonly status: AppointmentStatus;
  readonly notes: string;
  /** Rejection reason supplied by the service; `null` when none was given. */
  readonly rejectionReason: string | null;
  /** ISO date-time the request was created. */
  readonly requestedAt: string;
  /**
   * True for records seeded locally to demonstrate the list. Demo records are
   * always labelled as such in the UI and never presented as real requests.
   */
  readonly demo: boolean;
}

/* -------------------------------------------------------------------------- */
/* Patient QR identity                                                        */
/* -------------------------------------------------------------------------- */

export type QrIdentityState =
  /** No identity token was ever issued for this account. */
  | 'not-issued'
  /** A token exists and can be rendered as a QR. */
  | 'ready'
  /** The identity service is unreachable / not implemented yet. */
  | 'unavailable';
