import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

import { Colors } from '@/constants/brand';

/**
 * Single icon family for the whole app.
 *
 * Every icon goes through this wrapper so size and colour stay consistent and
 * no screen reaches for a different icon library (which is how mixed,
 * mismatched icon styles creep in).
 */
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function Icon({
  name,
  size = 20,
  color = Colors.primary,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
