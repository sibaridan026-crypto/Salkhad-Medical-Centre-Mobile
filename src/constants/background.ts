/**
 * The official Salkhad Medical Centre background image.
 *
 * Copied byte-for-byte from `Life Pulse Assets/Center/medical-background.png.jpg`.
 * The source file is named `.png.jpg` but its magic bytes are JPEG
 * (FF D8 FF), so it is stored here as `.jpg` to match its real format.
 *
 * This is the approved mobile background. It is intentionally subtle and sits
 * behind white content cards, so text keeps a strong contrast ratio.
 */
import { ImageSourcePropType } from 'react-native';

export const MedicalBackground: ImageSourcePropType = require(
  '@/assets/backgrounds/medical-background.jpg'
);