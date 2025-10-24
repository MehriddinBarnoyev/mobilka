import type React from "react"
import { View, StyleSheet } from "react-native"
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme"

interface SkeletonRowProps {
  paddingHorizontal?: number
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({ paddingHorizontal = SPACING.md }) => {
  return (
    <View style={[styles.row, { paddingHorizontal }]}>
      <View style={[styles.cell, { flex: 2 }]}>
        <View style={styles.skeletonCell} />
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <View style={styles.skeletonCell} />
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <View style={styles.skeletonCell} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    opacity: 0.7,
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  skeletonCell: {
    flex: 1,
    height: 14,
    backgroundColor: COLORS.skeleton,
    marginHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
})
