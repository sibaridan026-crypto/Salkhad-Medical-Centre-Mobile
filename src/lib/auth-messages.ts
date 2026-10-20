import type { StringsKey } from '@/i18n/strings';
import type { AuthErrorCode } from '@/services/auth';

const KEYS: Record<AuthErrorCode, StringsKey> = {
  name_required: 'errNameRequired',
  invalid_phone: 'errInvalidPhone',
  invalid_email: 'errInvalidEmail',
  weak_password: 'errWeakPassword',
  password_mismatch: 'errPasswordMismatch',
  dob_required: 'errDobRequired',
  dob_invalid: 'errDobInvalid',
  gender_required: 'errGenderRequired',
  account_exists: 'errAccountExists',
  invalid_credentials: 'errInvalidCredentials',
  no_account: 'errNoAccount',
  network_error: 'errNetworkError',
};

export function authErrorKey(code: AuthErrorCode): StringsKey {
  return KEYS[code];
}
