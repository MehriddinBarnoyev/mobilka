import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import axios from "axios"
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "../../constants/theme"

export default function DevicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { isSecured, setIsSecured } = useSecurity()

  const fromAccount = (route.params as { fromAccount?: boolean })?.fromAccount || false

  const {
    userLogin,
    deviceId,
    checking,
    loadingList,
    allowed,
    devices,
    errorMsg,
    refreshing,
    checkDevices,
    removeDevice,
    onRefresh,
    setDevices,
  } = useDevices()

  const handleRemoveDevice = (id: number) => {
    Alert.alert("Qurilmani o'chirish", "Ushbu qurilmani faol seanslardan olib tashlamoqchimisiz?", [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: "O'chirish",
        style: "destructive",
        onPress: async () => {
          try {
            await removeDevice(id)
            setTimeout(() => {
              setDevices((prev) => prev.filter((d) => d.id !== id))
              if (allowed === true) {
                navigation.replace("Home")
                setIsSecured(true)
              }
            }, 300)
          } catch (e: unknown) {
            const msg =
              (axios.isAxiosError(e) && (e.response?.data as { message?: string })?.message) ||
              (e as Error)?.toString() ||
              "O'chirish muvaffaqiyatsiz yakunlandi"
            Alert.alert("Xatolik", msg)
          }
        },
      },
    ])
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Faol qurilmalar</Text>

      {!userLogin || !deviceId ? (
        <StatusBanner status="loading" text="Boshlang'ich yuklanmoqda…" />
      ) : checking ? (
        <StatusBanner status="loading" text="Tekshirilmoqda…" />
      ) : allowed === true ? (
        <StatusBanner status="success" text="Ruxsat berilgan" />
      ) : allowed === false ? (
        <StatusBanner status="warning" text="Ruxsat berilmagan — qurilmalar ko'p" />
      ) : null}

      {!!errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Xatolik</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {allowed === false && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Amal zarur</Text>
          <Text style={styles.noticeText}>
            Maksimal qurilmalar soniga yetdingiz. Davom etish uchun pastdan kamida bitta qurilmani o'chiring va qayta
            tekshiring.
          </Text>
        </View>
      )}
    </View>
  )

  const renderFooter = () => {
    if (fromAccount || allowed !== true) {
      return null
    }

    return (
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => {
          navigation.replace("Home")
          setIsSecured(!isSecured)
        }}
      >
        <Text style={styles.primaryBtnText}>Davom etish</Text>
      </TouchableOpacity>
    )
  }

  const renderEmpty = () => {
    if (loadingList) return null

    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Seans topilmadi</Text>
        <Text style={styles.emptyText}>Faol qurilmalar ro'yxati bo'sh.</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundAlt} />
      <FlatList<DeviceBinding>
        data={devices}
        keyExtractor={(d) => String(d.id)}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <DeviceCard device={item} showDeleteButton={allowed === false} onDelete={handleRemoveDevice} />
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.ink,
    fontSize: FONT_SIZES["3xl"],
    fontWeight: "800",
    marginBottom: SPACING.sm + 2,
  },
  errorBox: {
    backgroundColor: COLORS.errorSoft,
    borderColor: "#FFC7D0",
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg + 2,
    padding: SPACING.md,
    marginTop: 6,
  },
  errorTitle: {
    color: COLORS.error,
    fontWeight: "800",
    marginBottom: 4,
    fontSize: FONT_SIZES.sm,
  },
  errorText: {
    color: COLORS.text.ink,
    fontSize: FONT_SIZES.sm,
  },
  notice: {
    backgroundColor: COLORS.slateSoft,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: BORDER_RADIUS.lg + 2,
    padding: SPACING.md,
    marginTop: SPACING.sm + 2,
  },
  noticeTitle: {
    color: COLORS.text.ink,
    fontWeight: "800",
    marginBottom: 4,
    fontSize: FONT_SIZES.sm,
  },
  noticeText: {
    color: COLORS.text.sub,
    fontSize: FONT_SIZES.sm,
  },
  primaryBtn: {
    marginTop: SPACING.lg + 2,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: BORDER_RADIUS.lg + 2,
    paddingVertical: SPACING.lg - 2,
    alignItems: "center",
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: FONT_SIZES.xl,
    letterSpacing: 0.3,
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: COLORS.text.ink,
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "800",
    marginBottom: 4,
  },
  emptyText: {
    color: COLORS.text.sub,
    fontSize: FONT_SIZES.sm,
  },
})
