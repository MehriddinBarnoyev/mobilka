import { View, Text, StyleSheet, type ViewStyle } from "react-native"
import {COLORS} from '../../constants/theme';

interface PasswordStrengthBarProps {
  password: string
  score: number
  label: string
}

export function PasswordStrengthBar({ password, score, label }: PasswordStrengthBarProps) {
  const bars = [0, 1, 2, 3]
  const fillStyle = getStrengthStyle(score)

  return (
    <View accessible accessibilityLabel={`Parol kuchi: ${label}`}>
      <View style={styles.strengthWrap}>
        {bars.map((i) => (
          <View key={i} style={[styles.strengthBar, i <= score - 1 && fillStyle]} />
        ))}
      </View>
      {!!password && <Text style={styles.strengthText}>{label}</Text>}
    </View>
  )
}

function getStrengthStyle(score: number): ViewStyle | undefined {
  if (score <= 0) return undefined
  if (score <= 2) return styles.sWeak
  if (score === 3) return styles.sGood
  return styles.sStrong
}

const styles = StyleSheet.create({
  strengthWrap: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: COLORS.STRENGTH_EMPTY,
  },
  sWeak: { backgroundColor: COLORS.STRENGTH_WEAK },
  sGood: { backgroundColor: COLORS.STRENGTH_GOOD },
  sStrong: { backgroundColor: COLORS.STRENGTH_STRONG },
  strengthText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
})
