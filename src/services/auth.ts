/**
 * Patient authentication service — self-contained demo, no network.
 *
 * Replaces the backend implementation. Everything runs on the device: a demo
 * patient account is seeded so sign-in works offline, and a registration made
 * in the demo is stored locally only (see `services/storage.ts`). The exported
 * signatures are unchanged, so no screen had to be rewritten.
 *
 * Authentication is NOT bypassed: sign-in still requires a matching phone and
 * password, registration still validates every field, and no screen can become
 * authenticated without going through these functions. The account and any
 * health data are fictional demo data, not real centre records.
 *
 * Every function is async so the pending/loading states stay real.
 */

import type { Gender, PatientAccount } from '@/data/types';
import { readJson, StorageKeys, storage, writeJson } from './storage';

export type AuthErrorCode =
  | 'name_required'
  | 'invalid_phone'
  | 'invalid_email'
  | 'weak_password'
  | 'password_mismatch'
  | 'dob_required'
  | 'dob_invalid'
  | 'gender_required'
  | 'account_exists'
  | 'invalid_credentials'
  | 'no_account'
  | 'network_error';

/** The authenticated patient. Account information only — no medical fields. */
export type AuthUser = PatientAccount;

export type AuthResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AuthErrorCode };

export const PasswordPolicy = {
  minLength: 6,
} as const;

/** The seeded demo patient. Clearly fictional, not a real centre record. */
const DEMO_PHONE = '0980374465';
const DEMO_PASSWORD = 'demo1234';
const DEMO_ACCOUNT: AuthUser = {
  id: 'demo-patient',
  fullName: 'Demo Patient',
  phone: DEMO_PHONE,
  email: null,
  dateOfBirth: null,
  gender: null,
};

/** The locally registered demo account (at most one), used to sign back in. */
interface StoredCredentials {
  readonly phone: string;
  readonly password: string;
  readonly account: AuthUser;
}

/** Strips spaces/dashes so `0980 374 465` and `0980374465` are the same. */
export function normalizePhone(input: string): string {
  return input.replace(/[\s-]/g, '').trim();
}

export function isValidPhone(input: string): boolean {
  return /^\d{6,15}$/.test(normalizePhone(input));
}

export function isValidEmail(input: string): boolean {
  const value = input.trim();
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * A plausible-past-date check only. It does not verify the patient's real age,
 * and it never rejects a date the patient is allowed to enter.
 */
function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isPastDate(value: string): boolean {
  const date = parseDate(value);
  if (!date) return false;
  return date.getTime() <= Date.now();
}

export interface RegisterInput {
  readonly fullName: string;
  readonly phone: string;
  readonly email?: string;
  readonly password: string;
  readonly confirmPassword: string;
  /** ISO `YYYY-MM-DD`. */
  readonly dateOfBirth: string;
  readonly gender: Gender | null;
}

export async function register(input: RegisterInput): Promise<AuthResult<AuthUser>> {
  const name = input.fullName.trim();
  if (name.length < 2) return { ok: false, error: 'name_required' };

  const phone = normalizePhone(input.phone);
  if (!isValidPhone(phone)) return { ok: false, error: 'invalid_phone' };

  const email = (input.email ?? '').trim();
  if (!isValidEmail(email)) return { ok: false, error: 'invalid_email' };

  if (input.password.length < PasswordPolicy.minLength) {
    return { ok: false, error: 'weak_password' };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: 'password_mismatch' };
  }

  const dateOfBirth = input.dateOfBirth.trim();
  if (!dateOfBirth) return { ok: false, error: 'dob_required' };
  if (!isPastDate(dateOfBirth)) return { ok: false, error: 'dob_invalid' };

  if (!input.gender) return { ok: false, error: 'gender_required' };

  const existing = await readJson<StoredCredentials>(StorageKeys.credentials);
  if (phone === DEMO_PHONE || (existing && existing.phone === phone)) {
    return { ok: false, error: 'account_exists' };
  }

  const user: AuthUser = {
    id: `patient-${Date.now()}`,
    fullName: name,
    phone,
    email: email || null,
    dateOfBirth,
    gender: input.gender,
  };

  await writeJson(StorageKeys.account, user);
  await writeJson(StorageKeys.credentials, {
    phone,
    password: input.password,
    account: user,
  } satisfies StoredCredentials);
  return { ok: true, value: user };
}

export async function signIn(
  phoneInput: string,
  password: string,
): Promise<AuthResult<AuthUser>> {
  const phone = normalizePhone(phoneInput);
  if (!isValidPhone(phone)) return { ok: false, error: 'invalid_phone' };

  if (phone === DEMO_PHONE && password === DEMO_PASSWORD) {
    await writeJson(StorageKeys.account, DEMO_ACCOUNT);
    return { ok: true, value: DEMO_ACCOUNT };
  }

  const stored = await readJson<StoredCredentials>(StorageKeys.credentials);
  if (stored && stored.phone === phone && stored.password === password) {
    await writeJson(StorageKeys.account, stored.account);
    return { ok: true, value: stored.account };
  }

  return { ok: false, error: 'invalid_credentials' };
}

/**
 * Restores a previously signed-in account for this process. Returns `null`
 * when nobody is signed in. There is no token: the stored account is the
 * session, and it is cleared on sign-out.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  const user = await readJson<PatientAccount>(StorageKeys.account);
  if (!user || typeof user.phone !== 'string') return null;
  return user;
}

export async function signOut(): Promise<void> {
  await storage.remove(StorageKeys.account);
}

/**
 * There is no backend token in the demo. Returns `null` so callers that show a
 * "signed in" state do not claim a server-issued credential exists.
 */
export async function getAuthToken(): Promise<string | null> {
  return null;
}

/** Saves an edit made from the patient profile (account fields only). */
export async function updateAccount(
  patch: Partial<Pick<AuthUser, 'fullName' | 'email' | 'dateOfBirth' | 'gender'>>,
): Promise<AuthResult<AuthUser>> {
  const current = await readJson<AuthUser>(StorageKeys.account);
  if (!current) return { ok: false, error: 'invalid_credentials' };

  const next: AuthUser = { ...current, ...patch };

  if (next.fullName.trim().length < 2) return { ok: false, error: 'name_required' };
  if (!isValidPhone(next.phone)) return { ok: false, error: 'invalid_phone' };
  if (!isValidEmail(next.email ?? '')) return { ok: false, error: 'invalid_email' };
  if (!next.dateOfBirth || !isPastDate(next.dateOfBirth)) {
    return { ok: false, error: 'dob_invalid' };
  }
  if (!next.gender) return { ok: false, error: 'gender_required' };

  await writeJson(StorageKeys.account, next);

  // Keep the stored credential copy in sync so the next sign-in is current.
  const stored = await readJson<StoredCredentials>(StorageKeys.credentials);
  if (stored && stored.phone === next.phone) {
    await writeJson(StorageKeys.credentials, { ...stored, account: next });
  }

  return { ok: true, value: next };
}
