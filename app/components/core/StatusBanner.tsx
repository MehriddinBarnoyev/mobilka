import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "../../constants/theme"

type BannerStatus = "loading" | "success" | "warning" | "error" | "info"

interface StatusBannerProps {
  status: BannerStatus
  text: string
}

export function StatusBanner({ status, text }: StatusBannerProps) {
  const getStyles = () => {
    switch (status) {
      case "loading":
        return {
          container: styles.loading,
          dot: styles.dotWarning,
        }
      case "success":
        return {
          container: styles.success,
          dot: styles.dotSuccess,
        }
      case "warning":
        return {
          container: styles.warning,
          dot: styles.dotWarning,
        }
      case "error":
        return {
          container: styles.error,
          dot: styles.dotError,
        }
      case "info":
        return {
          container: styles.info,
          dot: styles.dotInfo,
        }
    }
  }

  const bannerStyles = getStyles()

  return (
    <View style={[styles.container, bannerStyles.container]}>
      <View style={[styles.dot, bannerStyles.dot]} />
      {status === "loading" && <ActivityIndicator size="small" color={COLORS.warning} />}
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  loading: {
    backgroundColor: COLORS.warningSoft,
    borderColor: "#FFE2B8",
  },
  success: {
    backgroundColor: COLORS.successSoft,
    borderColor: "#CFECD7",
  },
  warning: {
    backgroundColor: COLORS.warningSoft,
    borderColor: "#FFE2B8",
  },
  error: {
    backgroundColor: COLORS.errorSoft,
    borderColor: "#FFC7D0",
  },
  info: {
    backgroundColor: COLORS.primaryBlueSoft,
    borderColor: "#C7DDFF",
  },
  text: {
    color: COLORS.text.ink,
    fontWeight: "700",
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginRight: SPACING.xs,
  },
  dotSuccess: {
    backgroundColor: COLORS.success,
  },
  dotError: {
    backgroundColor: COLORS.error,
  },
  dotWarning: {
    backgroundColor: COLORS.warning,
  },
  dotInfo: {
    backgroundColor: COLORS.info,
  },
})
