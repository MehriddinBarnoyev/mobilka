"use client"

import { useEffect, useState } from "react"
import {
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  PixelRatio,
} from "react-native"
import { ChevronDown, ChevronUp, X } from "lucide-react-native"
import api from "../../../core/api/apiService"

type ContentItem = {
  id: number
  type: "TEXT" | "IMAGE"
  textContent: string | null
  resourceKey: string | null
  orderNumber: number | null
  downloadUrl: string | null
}

interface AttachmentsProps {
  id: string | number
  onImagePress: (index: number, images: string[]) => void
}

export function Attachments({ id, onImagePress }: AttachmentsProps) {
  const [expanded, setExpanded] = useState(false)
  const [attachments, setAttachments] = useState<ContentItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const { width } = useWindowDimensions()
  const isMobile = width < 600
  const isTablet = width >= 600 && width < 1024
  const isDesktop = width >= 1024

  const scaleSpacing = (size: number) => {
    let multiplier: number
    if (width >= 1920) {
      multiplier = 1.4
    } else if (width >= 1440) {
      multiplier = 1.3
    } else if (width >= 1024) {
      multiplier = 1.2
    } else if (isTablet) {
      multiplier = 1.0
    } else {
      multiplier = 0.8
    }
    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier))
  }

  const scaleFont = (size: number) => {
    let multiplier: number
    if (width >= 1920) {
      multiplier = 1.3
    } else if (width >= 1440) {
      multiplier = 1.2
    } else if (width >= 1024) {
      multiplier = 1.1
    } else if (isTablet) {
      multiplier = 1.0
    } else {
      multiplier = 0.9
    }
    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier))
  }

  const fetchAttachments = async (id: string | number) => {
    try {
      const res = await api.get<ContentItem[]>(`services/videoedums/api/contents/media/${id}`)
      setAttachments(res.data || [])
    } catch (e: any) {
      console.error("Fetch Attachments Error:", e?.response?.data || e.message || e)
      setError("Failed to load attachments. Please try again.")
    }
  }

  useEffect(() => {
    if (id) {
      fetchAttachments(id)
    }
  }, [id])

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((v) => !v)
  }

  // Extract image URLs for carousel
  const imageUrls = attachments
    .filter((item) => item.type === "IMAGE" && item.downloadUrl)
    .map((item) => item.downloadUrl!)

  return (
    <View
      style={[
        styles.container,
        {
          padding: scaleSpacing(12),
          maxWidth: isDesktop ? 1200 : "100%",
          alignSelf: "center",
          width: "100%",
        },
      ]}
    >
      {/* Header row */}
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Yopish" : "Yana ko'rish"}
        style={({ pressed }) => [styles.header, { paddingVertical: scaleSpacing(8) }, pressed && { opacity: 0.7 }]}
        hitSlop={8}
      >
        <Text style={[styles.title, { fontSize: scaleFont(18) }]}>Darslikga oid ma'nbalar</Text>
        <View style={[styles.headerRight, { gap: scaleSpacing(6) }]}>
          {!expanded && <Text style={[styles.moreText, { fontSize: scaleFont(14) }]}>yana…</Text>}
          {expanded ? (
            <ChevronUp size={scaleFont(20)} color="#475569" />
          ) : (
            <ChevronDown size={scaleFont(20)} color="#475569" />
          )}
        </View>
      </Pressable>

      {/* Close pill when expanded */}
      {expanded && (
        <View style={[styles.controlsRow, { marginTop: scaleSpacing(6) }]}>
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel="Yopish"
            style={({ pressed }) => [
              styles.closePill,
              { paddingHorizontal: scaleSpacing(10), paddingVertical: scaleSpacing(6) },
              pressed && { opacity: 0.85 },
            ]}
            hitSlop={8}
          >
            <X size={scaleFont(14)} color="#0f172a" />
            <Text style={[styles.closePillText, { fontSize: scaleFont(12) }]}>Yopish</Text>
          </Pressable>
        </View>
      )}

      {/* Collapsible content */}
      {expanded && (
        <View style={[styles.content, { gap: scaleSpacing(12) }]}>
          {error ? (
            <Text style={[styles.errorText, { fontSize: scaleFont(16) }]}>{error}</Text>
          ) : attachments.length === 0 ? (
            <Text style={[styles.emptyText, { fontSize: scaleFont(16) }]}>No attachments available.</Text>
          ) : (
            attachments
              .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
              .map((item, index) => {
                if (item.type === "TEXT" && item.textContent) {
                  return <PlaceholderText key={item.id} text={item.textContent} fontSize={scaleFont(14)} />
                }
                if (item.type === "IMAGE" && item.downloadUrl) {
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => onImagePress(index, imageUrls)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="View attachment image in carousel"
                    >
                      <RemoteImage uri={item.downloadUrl} width={width} />
                    </TouchableOpacity>
                  )
                }
                return null
              })
          )}

          {/* See less button at bottom */}
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel="Kamroq ko'rsatish"
            style={({ pressed }) => [
              styles.seeLess,
              { paddingHorizontal: scaleSpacing(12), paddingVertical: scaleSpacing(8) },
              pressed && { opacity: 0.9 },
            ]}
            hitSlop={8}
          >
            <ChevronUp size={scaleFont(16)} color="#0f172a" />
            <Text style={[styles.seeLessText, { fontSize: scaleFont(13) }]}>Kamroq ko'rsatish</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

function RemoteImage({ uri, width }: { uri: string; width: number }) {
  let imageHeight: number
  if (width >= 1920) {
    imageHeight = 500
  } else if (width >= 1440) {
    imageHeight = 450
  } else if (width >= 1024) {
    imageHeight = 400
  } else if (width >= 768) {
    imageHeight = 350
  } else if (width >= 600) {
    imageHeight = 300
  } else {
    imageHeight = 200
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.imageBlock, { height: imageHeight }]}
      resizeMode="cover"
      accessible
      accessibilityLabel="Attachment image"
      onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
    />
  )
}

function PlaceholderText({ text, fontSize }: { text: string; fontSize: number }) {
  return (
    <Text
      style={[styles.textContent, { fontSize, lineHeight: fontSize * 1.4 }]}
      ellipsizeMode="tail"
      accessibilityLabel="Text placeholder"
    >
      {text}
    </Text>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerRight: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  moreText: {
    color: "#475569",
  },
  controlsRow: {
    alignItems: "flex-end",
  },
  closePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    alignSelf: "flex-end",
  },
  closePillText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  content: {
    marginTop: 8,
  },
  imageBlock: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f1f5f9",
  },
  textContent: {
    color: "#111",
    textAlign: "justify",
  },
  seeLess: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    marginTop: 4,
  },
  seeLessText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  errorText: {
    color: "#e11d48",
    textAlign: "center",
  },
  emptyText: {
    color: "#475569",
    textAlign: "center",
  },
})
