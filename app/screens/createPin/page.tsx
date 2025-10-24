"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {RootStackParamList} from '../../../type';
import {useApiCall} from '../../../hooks/useApiCalls';
import api from '../../../core/api/apiService';
import {STRINGS} from '../../constants/strings';
import {PIN_LENGTH, validatePin} from '../../../utils/validation';
import {BORDER_RADIUS, COLORS, SPACING} from '../../constants/theme';
import {PinDots} from '../../components/core/PinDots';
import {NumericKeypad} from '../../components/core/NumericKeypad';

type UserAccount = {
  login: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  designedName: string | null
  imageUrl: string | null
  activated: boolean
  langKey: string | null
  authorities?: string[]
}

export default function CreatePinCode() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [pin, setPin] = useState("")
  const [error, setError] = useState<string>("")
  const [user, setUser] = useState<UserAccount | null>(null)

  const { loading: isSubmitting, execute: executeSubmit } = useApiCall()
  const { loading: isUserLoading, error: userLoadError, execute: executeGetUser } = useApiCall<UserAccount>()

  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const canInteract = useMemo(() => !isSubmitting && !isUserLoading && !!user, [isSubmitting, isUserLoading, user])

  const getUser = useCallback(async () => {
    const result = await executeGetUser(() =>
      api.get<UserAccount>("/services/userms/api/account").then((res) => res.data),
    )
    if (result && isMounted.current) {
      setUser(result)
    }
  }, [executeGetUser])

  useEffect(() => {
    getUser()
  }, [getUser])

  const resetPin = useCallback(() => setPin(""), [])

  const submitPin = useCallback(
    async (value: string) => {
      if (!user) {
        setError(STRINGS.userDataNotReady)
        return
      }

      const validation = validatePin(value)
      if (!validation.isValid) {
        setError(validation.error!)
        resetPin()
        return
      }

      const payload = {
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        designedName: user.designedName,
        imageUrl: user.imageUrl,
        activated: user.activated,
        langKey: "en",
        authorities:
          user.authorities && user.authorities.length > 0
            ? user.authorities
            : ["VIEW_VIDEOS", "MOBILE_VIEW_VIDEOS", "MOBILE_VIEW_GROUPS", "VIEW_GROUP"],
        pinCode: value,
      }

      const result = await executeSubmit(() => api.post("/services/userms/api/change-pincode", payload))

      if (result) {
        Alert.alert(STRINGS.success, STRINGS.pinSaved, [
          { text: "OK", onPress: () => navigation.replace("Protection") },
        ])
      } else {
        setError(STRINGS.pinSaveError)
      }

      if (isMounted.current) {
        resetPin()
      }
    },
    [navigation, resetPin, user, executeSubmit],
  )

  const handleNumberPress = useCallback(
    (digit: string) => {
      if (!canInteract || pin.length >= PIN_LENGTH) return

      const next = pin + digit
      setPin(next)
      setError("")

      if (next.length === PIN_LENGTH) {
        submitPin(next)
      }
    },
    [canInteract, pin, submitPin],
  )

  const handleBackspace = useCallback(() => {
    if (pin.length === 0 || !canInteract) return
    setPin((p) => p.slice(0, -1))
    setError("")
  }, [pin.length, canInteract])

  const handleClearLongPress = useCallback(() => {
    if (!canInteract) return
    resetPin()
  }, [canInteract, resetPin])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG} />

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.infoContainer}>
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔐</Text>
              </View>

              <Text style={styles.title}>
                {user ? STRINGS.createPinFor(user.firstName ?? "", user.lastName ?? "") : STRINGS.createPin}
              </Text>

              <Text style={styles.subtitle}>{STRINGS.createPinSubtitle(PIN_LENGTH)}</Text>

              {isUserLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.PRIMARY} />
                  <Text style={[styles.subtitle, { marginTop: SPACING.SM }]}>{STRINGS.loading}</Text>
                </View>
              ) : userLoadError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{userLoadError}</Text>
                  <TouchableOpacity onPress={getUser} style={styles.retryBtn}>
                    <Text style={styles.retryBtnText}>{STRINGS.retry}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.codeSection}>
                <PinDots length={PIN_LENGTH} filledCount={pin.length} />
                {!!error && <Text style={styles.errorText}>{error}</Text>}
                {isSubmitting && <Text style={styles.subtitle}>{STRINGS.loading}</Text>}
              </View>
            </View>

            <View style={styles.keypadWrapper}>
              <NumericKeypad
                onNumberPress={handleNumberPress}
                onBackspace={handleBackspace}
                onClearLongPress={handleClearLongPress}
                disabled={!canInteract}
                canBackspace={pin.length > 0}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { flexGrow: 1, padding: SPACING.XL },
  infoContainer: { alignItems: "center" },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.KEYPAD_BG,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.LG,
  },
  lockIconText: { fontSize: 32 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
  },
  codeSection: { alignItems: "center", paddingVertical: SPACING.XL },
  loadingContainer: { paddingVertical: SPACING.LG, alignItems: "center" },
  errorContainer: { paddingVertical: SPACING.LG, alignItems: "center" },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 13,
    textAlign: "center",
    marginTop: SPACING.SM,
  },
  retryBtn: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.PRIMARY,
    marginTop: SPACING.SM,
  },
  retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  keypadWrapper: { marginTop: SPACING.LG },
})
