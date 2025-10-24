"use client"

import { useRef } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ShieldAlert } from "lucide-react-native"
import {RootStackParamList} from '../../../type';
import {usePasswordForm} from '../../../hooks/usePasswordForm';
import {useApiCall} from '../../../hooks/useApiCalls';
import api from '../../../core/api/apiService';
import {STRINGS} from '../../constants/strings';
import {MIN_PASSWORD_LENGTH} from '../../../utils/validation';
import {PasswordInput} from '../../components/core/PasswordInput';
import {PasswordStrengthBar} from '../../components/core/PasswordStrengthBar';
import {BORDER_RADIUS, COLORS, SPACING} from '../../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>

export default function ChangePasswordForce() {
  const { top, bottom } = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()

  const { form, errors, showPasswords, strength, isValid, setField, toggleShow, validate, reset } = usePasswordForm()

  const { loading, error: apiError, execute } = useApiCall()

  const newPassRef = useRef<TextInput | null>(null)
  const confirmRef = useRef<TextInput | null>(null)

  const handleSubmit = async () => {
    if (!validate()) return

    const payload = {
      currentPassword: form.currentPassword.trim(),
      newPassword: form.newPassword,
    }

    const result = await execute(() => api.post("services/userms/api/account/change-password", payload))

    if (result) {
      Alert.alert(STRINGS.success, STRINGS.passwordUpdated, [
        { text: STRINGS.continue, onPress: () => navigation.replace("Home") },
      ])
      reset()
    }
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Security Alert Header */}
      <View style={styles.alertHeader}>
        <View style={styles.alertIconWrap}>
          <ShieldAlert width={22} height={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>{STRINGS.securityAlert}</Text>
          <Text style={styles.alertSubtitle}>{STRINGS.securityTip(MIN_PASSWORD_LENGTH)}</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <PasswordInput
            label={STRINGS.currentPassword}
            placeholder={STRINGS.enterCurrentPassword}
            value={form.currentPassword}
            onChangeText={(t) => setField("currentPassword", t)}
            error={errors.currentPassword}
            showPassword={showPasswords.current}
            onToggleShow={() => toggleShow("current")}
            returnKeyType="next"
            onSubmitEditing={() => newPassRef.current?.focus()}
          />

          <View>
            <PasswordInput
              ref={newPassRef}
              label={STRINGS.newPassword}
              placeholder={STRINGS.enterNewPassword}
              value={form.newPassword}
              onChangeText={(t) => setField("newPassword", t)}
              error={errors.newPassword}
              showPassword={showPasswords.new}
              onToggleShow={() => toggleShow("new")}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <PasswordStrengthBar password={form.newPassword} score={strength.score} label={strength.label} />
          </View>

          <PasswordInput
            ref={confirmRef}
            label={STRINGS.confirmPassword}
            placeholder={STRINGS.confirmNewPassword}
            value={form.confirmNewPassword}
            onChangeText={(t) => setField("confirmNewPassword", t)}
            error={errors.confirmNewPassword}
            showPassword={showPasswords.confirm}
            onToggleShow={() => toggleShow("confirm")}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {apiError && (
            <View style={styles.bannerError} accessibilityLiveRegion="polite">
              <Text style={styles.bannerText}>{apiError}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={loading || !isValid}
            style={({ pressed }) => [
              styles.btn,
              (!isValid || loading) && styles.btnDisabled,
              pressed && !loading && isValid && styles.btnPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || !isValid }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{STRINGS.updatePassword}</Text>
            )}
          </Pressable>

          <View style={styles.tipsBox}>
            <Text style={styles.tipTitle}>{STRINGS.tips}</Text>
            <Text style={styles.tipItem}>{STRINGS.tipDontReuse}</Text>
            <Text style={styles.tipItem}>{STRINGS.tipAvoidPersonal}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.PRIMARY_SOFT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.PRIMARY_BORDER,
  },
  alertIconWrap: {
    marginTop: 2,
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: { fontWeight: "700", fontSize: 16, color: COLORS.TEXT_PRIMARY },
  alertSubtitle: { marginTop: 4, color: COLORS.TEXT_SECONDARY, fontSize: 13, lineHeight: 18 },
  content: { padding: SPACING.LG, gap: SPACING.LG },
  bannerError: {
    marginTop: SPACING.SM,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.ERROR_SOFT,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
  },
  bannerText: { color: COLORS.ERROR_TEXT, fontSize: 13 },
  btn: {
    marginTop: SPACING.MD,
    height: 48,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  btnPressed: { opacity: 0.85 },
  btnDisabled: { backgroundColor: COLORS.PRIMARY_DISABLED },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  tipsBox: {
    marginTop: SPACING.LG,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  tipItem: { fontSize: 12, color: COLORS.TEXT_SECONDARY, lineHeight: 18 },
})
