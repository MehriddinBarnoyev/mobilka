import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SPACING,
} from '../../constants/theme';
import {formatUzbekDate} from '../../../utils/date';

export interface DeviceBinding {
  createdBy: string
  createdDate: string
  lastModifiedBy: string
  lastModifiedDate: string
  id: number
  deviceId: string
  userLogin: string
  status: "ACTIVE" | "INACTIVE" | string
}

interface DeviceCardProps {
  device: DeviceBinding
  showDeleteButton?: boolean
  onDelete?: (id: number) => void
}

export function DeviceCard({ device, showDeleteButton, onDelete }: DeviceCardProps) {
  const isActive = device.status === "ACTIVE"

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {device.deviceId}
        </Text>
        <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeMuted]}>
          <Text style={styles.badgeText}>{device.status}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaKey}>Foydalanuvchi</Text>
        <Text style={styles.metaVal}>{device.userLogin}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaKey}>Yaratildi</Text>
        <Text style={styles.metaVal}>{formatUzbekDate(device.createdDate)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaKey}>Yangilandi</Text>
        <Text style={styles.metaVal}>{formatUzbekDate(device.lastModifiedDate)}</Text>
      </View>

      {showDeleteButton && onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(device.id)}>
          <Text style={styles.deleteBtnText}>Ushbu qurilmani o'chirish</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    shadowColor: "#1b1f3b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: COLORS.text.ink,
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    flex: 1,
    marginRight: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeActive: {
    backgroundColor: COLORS.primaryBlueSoft,
  },
  badgeMuted: {
    backgroundColor: COLORS.slateSoft,
  },
  badgeText: {
    color: COLORS.text.ink,
    fontWeight: "700",
    fontSize: FONT_SIZES.xs,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm + 2,
  },
  metaKey: {
    color: COLORS.text.sub,
    fontWeight: "600",
    fontSize: FONT_SIZES.sm,
  },
  metaVal: {
    color: COLORS.text.ink,
    fontWeight: "700",
    fontSize: FONT_SIZES.sm,
  },
  deleteBtn: {
    marginTop: SPACING.lg - 2,
    backgroundColor: COLORS.errorSoft,
    borderColor: "#FFC7D0",
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  deleteBtnText: {
    color: COLORS.error,
    fontWeight: "800",
    fontSize: FONT_SIZES.sm,
  },
})
