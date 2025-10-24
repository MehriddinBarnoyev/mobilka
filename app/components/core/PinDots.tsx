import { View, StyleSheet } from "react-native"
import { COLORS } from "../../constants/theme"

interface PinDotsProps {
  length: number
  filledCount: number
  dotSize?: number
  spacing?: number
}

export function PinDots({ length, filledCount, dotSize = 16, spacing = 8 }: PinDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { width: dotSize, height: dotSize, borderRadius: dotSize / 2, marginHorizontal: spacing },
            i < filledCount ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  dot: {
    borderWidth: 2,
  },
  dotEmpty: {
    backgroundColor: "transparent",
    borderColor: COLORS.border,
  },
  dotFilled: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
})
