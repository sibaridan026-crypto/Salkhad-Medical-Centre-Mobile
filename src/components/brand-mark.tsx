import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/brand';
import { Icon } from './icon';

/**
 * UI brand mark for the app: a compact rounded square in the medical purple
 * with a white heart-and-plus glyph.
 *
 * Deliberately clean, minimal and well proportioned — small enough to sit in a
 * compact header without dominating the center's name, and sized so the glyph
 * keeps an even margin on all four sides.
 *
 * This is a product UI mark only. It is NOT a claim that it is the center's
 * official registered logo, and no text is ever baked into it: the name is
 * always spelled out separately as Salkhad Medical Centre / مجمع صلخد الطبي.
 */
export function BrandMark({
  size = 36,
  tone = 'solid',
}: {
  size?: number;
  /** `solid` = purple well (default), `surface` = soft lavender well. */
  tone?: 'surface' | 'solid';
}) {
  const solid = tone === 'solid';

  return (
    <View
      style={[
        styles.well,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.3),
          backgroundColor: solid ? Colors.primary : Colors.primarySurface,
          borderColor: solid ? Colors.primaryDark : Colors.lavenderBorder,
        },
      ]}
    >
      <Icon
        name="heart-plus"
        size={Math.round(size * 0.56)}
        color={solid ? Colors.textInverse : Colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
  },
});
