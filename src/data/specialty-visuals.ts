import type { ImageSourcePropType } from 'react-native';

import type { AccentName } from '@/constants/brand';
import type { IconName } from '@/components/icon';

/**
 * Presentation-only metadata for the 14 specialties.
 *
 * These maps choose *how* a specialty is drawn (a MaterialCommunityIcons glyph
 * and a brand accent) and which generated cover image to use. They add no
 * medical meaning and no claim about the centre.
 */

export const SPECIALTY_GLYPH: Readonly<Record<string, IconName>> = {
  neurosurgery: 'brain',
  pediatrics: 'baby-face-outline',
  obstetrics: 'human-pregnant',
  cardiology: 'heart-pulse',
  ent: 'ear-hearing',
  physiotherapy: 'arm-flex-outline',
  urology: 'water-outline',
  orthopedics: 'bone',
  'general-surgery': 'medical-bag',
  endocrinology: 'water-percent',
  dermatology: 'spa',
  gastroenterology: 'stomach',
  rheumatology: 'hand-heart-outline',
  psychiatry: 'head-heart-outline',
};

export const SPECIALTY_ACCENT: Readonly<Record<string, AccentName>> = {
  neurosurgery: 'primary',
  pediatrics: 'teal',
  obstetrics: 'lavender',
  cardiology: 'blue',
  ent: 'teal',
  physiotherapy: 'primary',
  urology: 'blue',
  orthopedics: 'teal',
  'general-surgery': 'primary',
  endocrinology: 'blue',
  dermatology: 'lavender',
  gastroenterology: 'teal',
  rheumatology: 'primary',
  psychiatry: 'lavender',
};

/**
 * Generated cover images (see `scripts/generate-specialty-images.ps1`). These
 * are local generated illustrations, not photographs and not third-party art.
 */
export const SPECIALTY_IMAGES: Readonly<Record<string, ImageSourcePropType>> = {
  neurosurgery: require('../../assets/specialties/neurosurgery.png'),
  pediatrics: require('../../assets/specialties/pediatrics.png'),
  obstetrics: require('../../assets/specialties/obstetrics.png'),
  cardiology: require('../../assets/specialties/cardiology.png'),
  ent: require('../../assets/specialties/ent.png'),
  physiotherapy: require('../../assets/specialties/physiotherapy.png'),
  urology: require('../../assets/specialties/urology.png'),
  orthopedics: require('../../assets/specialties/orthopedics.png'),
  'general-surgery': require('../../assets/specialties/general-surgery.png'),
  endocrinology: require('../../assets/specialties/endocrinology.png'),
  dermatology: require('../../assets/specialties/dermatology.png'),
  gastroenterology: require('../../assets/specialties/gastroenterology.png'),
  rheumatology: require('../../assets/specialties/rheumatology.png'),
  psychiatry: require('../../assets/specialties/psychiatry.png'),
};
