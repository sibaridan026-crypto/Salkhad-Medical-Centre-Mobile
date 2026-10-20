# Salkhad Medical Centre — Mobile App

Patient, doctor and reception (admin) mobile application for Salkhad Medical Centre, built with **Expo SDK 57** and **expo-router** (file-based routing), in **TypeScript**. The interface is **bilingual Arabic / English** with full right-to-left support.

> **Current state: OFFLINE DEMO MODE.**
> The app runs entirely on the device with no backend and no network calls. Every
> account, doctor, appointment and record it displays is **fictional demo data**
> — none of it is a real centre record, and no real patient information is
> stored anywhere in this repository.

---

## Stack

| | |
|---|---|
| Expo SDK | `~57.0.26` |
| expo-router | `~57.0.24` (file-based routing, `src/app`) |
| React Native | `0.86.3` |
| React | `19.2.3` |
| TypeScript | `~6.0.3` |
| New Architecture | enabled (Fabric + TurboModules) |
| Hermes | enabled |
| Android application id | `com.sibaridan.salkhadmedicalcenter` |
| EAS project id | `4cd8f393-696e-48b1-a273-05763d18e903` |

All dependency versions are pinned in `package.json` / `package-lock.json`. Do not upgrade
or regenerate the lockfile without a reason — the tested APK was produced against exactly
these versions.

---

## Offline demo mode

Demo mode is the app's current operating mode and is **intentionally preserved**. It is a
deliberate, self-contained replacement of the backend services — not a stripped-down
build, and not a placeholder that was left behind.

**What it means in practice**

- **No network is used.** The services under `src/services/` are local implementations:
  `auth.ts`, `appointments.ts`, `doctors.ts`, `specialties.ts` and the rest read from the
  local data layer and from the on-device store (`src/services/storage.ts`). Their exported
  signatures are unchanged from the backend versions, so no screen had to be rewritten to
  run offline.
- **Authentication is *not* bypassed.** Sign-in still requires a matching phone number and
  password, registration still validates every field, and no screen can become
  authenticated without going through `src/services/auth.ts`. A demo patient account is
  *seeded* — the patient still signs in normally to reach it.
- **Data is fictional and local.** Seeded records carry a `demo: true` flag and are badged
  as demo data in the UI. Records the patient creates in the demo are flagged `demo: false`
  and are stored on that device only.
- **Content is the centre's supplied material.** The doctor roster (23 doctors) and the
  specialty list (14 specialties) are copied verbatim from the schedule supplied by the
  project owner. No ratings, experience or credentials were invented.

**Demo accounts** (fictional, local-only, and shown on the sign-in screens themselves):

| Area | Phone | Password |
|---|---|---|
| Patient | `0980374465` | `demo1234` |
| Doctor | `0990000001` | `doctor1234` |
| Reception / admin | `0990000002` | `admin1234` |

These are demo fixtures, not credentials for any real system.

### Routes

| Route | Area |
|---|---|
| `src/app/auth/login.tsx` | Patient sign-in |
| `src/app/auth/register.tsx` | Patient registration |
| `src/app/auth/health-profile.tsx` | First-run health profile |
| `src/app/auth/employee-login.tsx` | Employee (doctor / reception) sign-in |
| `src/app/patient/**` | Patient area — appointments, doctors, specialties, profile, medical file, medications, notifications, QR identity |
| `src/app/doctor/index.tsx` | Doctor interface |
| `src/app/admin/index.tsx` | Reception / admin interface |

---

## Getting started

```bash
npm install
npx expo start
```

Then press `a` for an Android emulator, `i` for an iOS simulator, or scan the QR code with
Expo Go. The app needs no backend to run in demo mode.

### Scripts

| Script | Purpose |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Build and run on a native Android device/emulator |
| `npm run ios` | Build and run on an iOS simulator |
| `npm run web` | Start the web target |
| `npm run lint` | Run `expo lint` |
| `npm run reset-project` | **Destructive.** Moves the app source aside and re-creates an empty Expo template. Do not run it in this repository. |

---

## Configuration

The backend base URL is read from the `EXPO_PUBLIC_API_URL` environment variable, falling
back to `http://localhost:5104` (see `src/config/api.ts`).

```bash
cp .env.example .env
```

`.env` is gitignored and must never be committed. `.env.example` contains only a
placeholder. The `EXPO_PUBLIC_` prefix means the value is inlined into the app bundle at
build time and is therefore **public** — never put an API key, token or password in it.

---

## Android APK

The tested Android APK was produced by **EAS Build on October 19, 2026**.

| | |
|---|---|
| Build id | `12d6b86b-342e-4e81-8405-ebd72a8dc3ea` |
| Status | `FINISHED` — Android, profile `preview` (`buildType: apk`), internal distribution |
| Expo SDK / app version | `57.0.0` / `1.0.0` (build `1`) |
| Application id | `com.sibaridan.salkhadmedicalcenter` |
| Build window | 2026-10-19 11:34:47 UTC → 11:47:42 UTC |

**Verified build page:**

https://expo.dev/accounts/sibaridan/projects/salkhad-medical-center/builds/12d6b86b-342e-4e81-8405-ebd72a8dc3ea

The direct `.apk` download link will be added here once it has been re-verified. EAS
artifact links are time-limited, so the build page above is the durable reference.

Rebuild with:

```bash
npx eas-cli build --platform android --profile preview
```

---

## Project layout

```
src/
  app/          expo-router routes (auth, patient, doctor, admin)
  components/   shared UI, including components/ui and components/patient
  config/       API configuration
  constants/    brand tokens, background and centre image
  data/         local seed data (doctors, specialties, contact details, types)
  hooks/        reserved (currently empty)
  i18n/         Arabic / English strings and language context
  lib/          auth messages, booking and doctor helpers
  services/     data access layer (offline demo implementations)
  state/        auth context
  theme/        theme, accents, theme context
assets/         icons, splash, doctor photos, specialty images
android/        generated native project (not tracked — see below)
```

### The `android/` folder

`android/` is generated output, produced by `npx expo prebuild` from `app.json` and the
installed dependencies. It contains no hand-written native code and is excluded from
version control by the `/android` rule in `.gitignore`, along with `/ios`. A fresh clone
regenerates it automatically on the first native build. The application id, app name,
icons and splash screen are all defined in `app.json`.

### `.demo-backup/`

A local safety snapshot of the demo-mode source, kept on this machine only. It is ignored
by both `.gitignore` and `.easignore` and is never part of a build or a commit.

---

## Security notes

- No secrets are stored in this repository. `.env` is gitignored; `.env.example` holds a
  placeholder only.
- The Android release signing key is **not** in this repository and not on this machine —
  EAS Build uses the remote keystore stored against the EAS project.
- No real patient information, medical record or real credential is present. All demo
  data is fictional and generated locally; the demo accounts listed above are local
  fixtures, not working credentials.
- Keystores, `*.jks`, `*.p12`, `*.p8`, `*.key`, `*.keystore`, `*.mobileprovision` and
  `*.pem` are excluded from version control, as are `*.apk` / `*.aab` build outputs.

---

## License

MIT — see [LICENSE](LICENSE).

> The `LICENSE` file still carries the Expo template copyright line. The clinic's own
> copyright holder should replace it before this repository is published.
