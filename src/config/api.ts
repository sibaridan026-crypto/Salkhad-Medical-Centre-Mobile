/**
 * API configuration.
 *
 * The backend base URL is read from the `EXPO_PUBLIC_API_URL` environment
 * variable, with `http://localhost:5104` as the fallback for local web
 * development and emulators.
 *
 * For Expo Go on a physical device, "localhost" refers to the device itself,
 * not the computer. Set `EXPO_PUBLIC_API_URL` in a `.env` file to the
 * computer's LAN address, for example:
 *
 *   EXPO_PUBLIC_API_URL=http://192.168.1.42:5104
 *
 * Do not hardcode a LAN IP here: it differs between networks and devices.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5104';

export const API_AUTH_REGISTER = `${API_BASE_URL}/api/auth/register`;
export const API_AUTH_LOGIN = `${API_BASE_URL}/api/auth/login`;
