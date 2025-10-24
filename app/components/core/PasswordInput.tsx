import { forwardRef } from "react"
import { View, Text, TextInput, Pressable, StyleSheet, type TextInputProps } from "react-native"
import { Lock, Eye, EyeOff } from "lucide-react-native"
import { COLORS } from "../../constants/theme"

const SPACING = {
  XS: 6,
  SM: 8,
  MD: 12,
  LG: 16,
}

const BORDER_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
}

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label: string
  error?: string
  showPassword: boolean
  onToggleShow: () => void
}

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ label, error, showPassword, onToggleShow, value, ...props }, ref) => {
    const hasError = !!error
    const isFilled = !!value

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputRow, hasError && styles.inputRowError, isFilled && styles.inputRowFilled]}>
          <Lock width={18} height={18} color={COLORS.ICON} />
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={value}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            accessibilityLabel={label}
            {...props}
          />
          <Pressable
            onPress={onToggleShow}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Yashirish" : "Ko'rsatish"}
            hitSlop={10}
            style={styles.iconBtn}
          >
            {showPassword ? (
              <EyeOff width={20} height={20} color={COLORS.ICON} />
            ) : (
              <Eye width={20} height={20} color={COLORS.ICON} />
            )}
          </Pressable>
        </View>
        {hasError && <Text style={styles.errorText}>{error}</Text>}
      </View>
    )
  },
)

PasswordInput.displayName = "PasswordInput"

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.MD },
  label: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.INPUT_BG,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.SM,
    height: 48,
  },
  inputRowFilled: { borderColor: COLORS.BORDER_ACTIVE },
  inputRowError: { borderColor: COLORS.error},
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
    marginLeft: SPACING.SM,
  },
  iconBtn: {
    paddingHorizontal: SPACING.XS,
    paddingVertical: SPACING.XS,
  },
  errorText: {
    marginTop: SPACING.XS,
    color: COLORS.error,
    fontSize: 12,
  },
})
