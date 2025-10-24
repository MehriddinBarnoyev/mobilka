"use client"

import type React from "react"
import { useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import {formatExpirationDate} from '../../../utils/date';
import {BORDER_RADIUS, COLORS, SPACING} from '../../constants/theme';
import {Item} from '../../../types/shared';

interface MediaItemRowProps {
  item: Item
  onPress: () => void
  thumbnailSize: number
  iconSize: number
  fontSizeCell: number
  fontSizeType: number
}

export const MediaItemRow: React.FC<MediaItemRowProps> = ({
                                                            item,
                                                            onPress,
                                                            thumbnailSize,
                                                            iconSize,
                                                            fontSizeCell,
                                                            fontSizeType,
                                                          }) => {
  const getItemInfo = useCallback(() => {
    switch (item.type) {
      case "GROUP":
        return {
          itemCount: `${item.playlists.length} Playlists, ${item.videos.length} Videos`,
          iconName: "folder",
        }
      case "PLAYLIST":
        return {
          itemCount: `${item.videos.length} Videos`,
          iconName: "list",
        }
      case "VIDEO":
        return {
          itemCount: "",
          iconName: "play-circle",
        }
      default:
        return { itemCount: "", iconName: "help" }
    }
  }, [item])

  const { itemCount, iconName } = getItemInfo()
  const formattedExpirationDate = formatExpirationDate(item.expirationDate)

  return (
    <TouchableOpacity style={[styles.row, Platform.OS === "web" && styles.rowHover]} onPress={onPress}>
  <View style={[styles.cell, { flex: 2 }]}>
  <View style={styles.cellContent}>
    {item.type === "VIDEO" && item.coverImageUrl && (
        <View style={[styles.thumbnailContainer, { width: thumbnailSize, height: thumbnailSize }]}>
  <Image
    source={{ uri: item.coverImageUrl }}
  style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
  resizeMode="cover"
  />
  <Ionicons
    name="play-circle"
  size={iconSize}
  color="#ffffff"
  style={[
      styles.thumbnailIcon,
  { transform: [{ translateX: -iconSize / 2 }, { translateY: -iconSize / 2 }] },
]}
  />
  </View>
)}
  {(item.type !== "VIDEO" || !item.coverImageUrl) && (
    <Ionicons name={iconName} size={iconSize} color={COLORS.primary} style={styles.icon} />
  )}
  <ScrollView
    horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.nameScrollContainer}
  contentContainerStyle={styles.nameScrollContent}
  >
  <Text style={[styles.cellText, { fontSize: fontSizeCell }]}>{item.name}</Text>
  </ScrollView>
  </View>
  </View>
  <View style={[styles.cell, { flex: 1 }]}>
  <Text style={[styles.cellText, { fontSize: fontSizeCell }]}>{itemCount}</Text>
  </View>
  <View style={[styles.cell, { flex: 1 }]}>
  <Text style={[styles.cellTypeText, { fontSize: fontSizeType }]}>{item.type}</Text>
  <Text style={[styles.expirationText, { fontSize: fontSizeType }]}>{formattedExpirationDate}</Text>
  </View>
  </TouchableOpacity>
)
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rowHover: {
    ...Platform.select({
      web: {
        transitionDuration: "200ms",
        transitionProperty: "transform, shadow",
        ":hover": {
          transform: [{ scale: 1.02 }],
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
      },
    }),
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  cellContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cellText: {
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  cellTypeText: {
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: SPACING.md,
  },
  thumbnail: {
    borderRadius: BORDER_RADIUS.sm,
  },
  thumbnailContainer: {
    position: "relative",
    marginRight: SPACING.md,
  },
  thumbnailIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  nameScrollContainer: {
    flex: 1,
    maxWidth: "80%",
  },
  nameScrollContent: {
    alignItems: "center",
  },
  expirationText: {
    color: "#6b7280",
    fontWeight: "400",
    marginTop: SPACING.xs,
  },
})
