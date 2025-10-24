import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { ChevronRight } from "lucide-react-native"
import type { LucideIcon } from "lucide-react-native"
import {BORDER_RADIUS, COLORS, SPACING} from '../../constants/theme';
import Soon from '../soon/soon';

interface MenuItemProps {
  title: string
  onPress: () => void
  icon: LucideIcon
  isDestructive?: boolean
  status?: boolean
}

export const MenuItem: React.FC<MenuItemProps> = ({
                                                    title,
                                                    onPress,
                                                    icon: Icon,
                                                    isDestructive = false,
                                                    status = true,
                                                  }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7} disabled={!status}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.destructiveIconContainer]}>
          <Icon size={20} color={isDestructive ? COLORS.destructive : COLORS.text.tertiary} strokeWidth={1.5} />
        </View>
        <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{title}</Text>
      </View>

      <ChevronRight size={20} color="#CCCCCC" strokeWidth={1.5} />

      {!status && <Soon />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  destructiveIconContainer: {
    backgroundColor: "#FFF5F5",
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: "500",
    flex: 1,
  },
  destructiveText: {
    color: COLORS.destructive,
  },
})
