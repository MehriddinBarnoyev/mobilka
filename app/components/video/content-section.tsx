"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, useWindowDimensions, Platform } from "react-native"
import { Attachments } from "./attachments"
import { VdoDownload } from "vdocipher-rn-bridge"
import type { DownloadStatus, Track } from "vdocipher-rn-bridge/type"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { isTablet } from "../../../utils/responsive"
import { OfflineDownload, ScreenSecurity } from "../../../utils/OfflineDownloadManager"
import { useScaling } from "../../../hooks/useScaling"
type ContentItem = {
  id: number
  type: "TEXT" | "IMAGE"
  textContent: string | null
  orderNumber: number | null
  downloadUrl: string | null
  resourceKey?: string | null
}

type ContentSectionProps = {
  title: string
  otp: string | null
  playbackInfo: any
  contents: ContentItem[]
  contentImages: string[]
  videoId: number | string
  containerWidth: number
  isSplitLayout: boolean
  onImagePress: (imageUrl: string) => void
  onImageError: () => void
  onPlayOffline?: (mediaId: string) => void
}

export const ContentSection = ({
  title,
  otp,
  playbackInfo,
  contents,
  contentImages,
  videoId,
  containerWidth,
  isSplitLayout,
  onImagePress,
  onImageError,
  onPlayOffline,
}: ContentSectionProps) => {
  console.log("[v0] ContentSection mounted/rendered", { videoId, title })

  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null)
  const [isScreenCaptured, setIsScreenCaptured] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isIOSModuleAvailable, setIsIOSModuleAvailable] = useState(false)

  const { width } = useWindowDimensions()
  const { scaleFont, scaleSpacing } = useScaling()
  const { top, bottom } = useSafeAreaInsets()

  const isMobile = width < 600
  const isTabletDevice = isTablet()
  const isDesktop = width >= 1024
  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"

  const mediaIdRef = useRef<string | null>(null)

  useEffect(() => {
    console.log("[v0] Checking iOS module availability", { isIOS })

    if (isIOS) {
      const offlineAvailable = OfflineDownload.isAvailable()
      const securityAvailable = ScreenSecurity.isAvailable()
      const available = offlineAvailable && securityAvailable

      console.log("[v0] iOS module check results:", {
        offlineAvailable,
        securityAvailable,
        available,
      })

      setIsIOSModuleAvailable(available)

      if (!available) {
        console.warn(
          "[v0] iOS native modules not available. OfflineDownload:",
          offlineAvailable,
          "ScreenSecurity:",
          securityAvailable,
        )
      } else {
        console.log("[v0] iOS native modules are available and ready")
      }
    }
  }, [isIOS])

  useEffect(() => {
    console.log("[v0] Setting up screen capture listeners", {
      isIOS,
      securityAvailable: ScreenSecurity.isAvailable(),
    })

    if (!isIOS || !ScreenSecurity.isAvailable()) {
      console.log("[v0] Skipping screen capture listeners - not available")
      return
    }

    try {
      const captureListener = ScreenSecurity.addScreenCaptureListener((event) => {
        console.log("[v0] Screen capture detected:", event)
        setIsScreenCaptured(true)

        if (event.type === "screenshot") {
          Alert.alert("Ogohlantirish", "Skrinshot olish taqiqlangan. Iltimos, kontentni hurmat qiling.")
        }
      })

      const endListener = ScreenSecurity.addScreenCaptureEndedListener((event) => {
        console.log("[v0] Screen capture ended:", event)
        setIsScreenCaptured(false)
      })

      console.log("[v0] Screen capture listeners registered successfully")

      return () => {
        console.log("[v0] Cleaning up screen capture listeners")
        captureListener.remove()
        endListener.remove()
      }
    } catch (error) {
      console.error("[v0] Failed to setup screen capture listeners:", error)
    }
  }, [isIOS])

  useEffect(() => {
    console.log("[v0] Setting up download event listeners", {
      isIOS,
      moduleAvailable: OfflineDownload.isAvailable(),
    })

    if (!isIOS || !OfflineDownload.isAvailable()) {
      console.log("[v0] Skipping download event listeners - not available")
      return
    }

    try {
      const progressListener = OfflineDownload.addDownloadProgressListener((event) => {
        console.log("[v0] Download progress event:", event)

        if (event.videoId === String(videoId)) {
          setDownloadStatus((prev) => {
            if (!prev) return null
            return {
              ...prev,
              downloadPercent: event.progress,
              status: "downloading",
            }
          })
        }
      })

      const completeListener = OfflineDownload.addDownloadCompleteListener((event) => {
        console.log("[v0] Download complete event:", event)

        if (event.videoId === String(videoId)) {
          setDownloadStatus((prev) => {
            if (!prev) return null
            return {
              ...prev,
              downloadPercent: 100,
              status: "completed",
            }
          })

          Alert.alert("Muvaffaqiyat", "Video muvaffaqiyatli yuklab olindi!")
        }
      })

      const errorListener = OfflineDownload.addDownloadErrorListener((event) => {
        console.log("[v0] Download error event:", event)

        if (event.videoId === String(videoId)) {
          Alert.alert("Xato", `Yuklab olishda xatolik: ${event.error}`)
          setDownloadStatus((prev : any) => {
            if (!prev) return null
            return {
              ...prev,
              status: "failed",
              reason: event.error,
            }
          })
        }
      })

      console.log("[v0] Download event listeners registered successfully")

      return () => {
        console.log("[v0] Cleaning up download event listeners")
        progressListener.remove()
        completeListener.remove()
        errorListener.remove()
      }
    } catch (error) {
      console.error("[v0] Failed to setup download event listeners:", error)
    }
  }, [isIOS, videoId])

  const getSelection = (tracks: Track[]) => {
    const selections: number[] = []
    const video = tracks.findIndex((t) => t.type === "video")
    const audio = tracks.findIndex((t) => t.type === "audio")
    if (video !== -1) selections.push(video)
    if (audio !== -1) selections.push(audio)
    return selections
  }

  const syncStatus = useCallback(() => {
    console.log("[v0] syncStatus called", {
      isIOS,
      isAndroid,
      isIOSModuleAvailable,
      mediaId: mediaIdRef.current,
    })

    if (isIOS && isIOSModuleAvailable) {
      const id = mediaIdRef.current
      if (!id) {
        console.log("[v0] No mediaId to sync (iOS)")
        return
      }

      console.log("[v0] Syncing iOS downloads for mediaId:", id)

      OfflineDownload.getAllDownloads()
        .then((downloads) => {
          console.log("[v0] iOS downloads fetched:", downloads.length)
          const found = downloads.find((d) => d.videoId === id)
          if (found) {
            console.log("[v0] Found matching download:", found)
            setDownloadStatus({
                mediaInfo: { mediaId: id, title: found.title || title },
                status: found.status,
                downloadPercent: found.progress,
                enableAutoResume: true,
                reason: "",
                reasonDescription: "",
                poster: "",
            } as unknown as DownloadStatus)
          } else {
            console.log("[v0] No matching download found for mediaId:", id)
          }
        })
        .catch((err) => {
          console.warn("[v0] iOS sync error:", err)
        })
      return
    }

    if (isAndroid) {
      const id = mediaIdRef.current
      if (!id) {
        console.log("[v0] No mediaId to sync (Android)")
        return
      }

      console.log("[v0] Syncing Android downloads for mediaId:", id)

      VdoDownload.query()
        .then((statusList: DownloadStatus[]) => {
          console.log("[v0] Android downloads fetched:", statusList.length)
          const found = statusList.find((s) => s.mediaInfo.mediaId === id)
          if (found) {
            console.log("[v0] Found matching download:", found)
          }
          setDownloadStatus(found || null)
        })
        .catch((err: any) => {
          console.warn("[v0] Android sync error:", err)
          setDownloadStatus(null)
        })
    }
  }, [isIOS, isAndroid, isIOSModuleAvailable, title])

  const handleDownload = async () => {
    console.log("[v0] ========== HANDLE DOWNLOAD ==========")
    console.log("[v0] Download button pressed")
    console.log("[v0] Current state:", {
      hasOtp: !!otp,
      hasPlaybackInfo: !!playbackInfo,
      isDownloading,
      isIOS,
      isAndroid,
      isIOSModuleAvailable,
      downloadStatus: downloadStatus?.status,
    })

    if (!otp || !playbackInfo) {
      console.error("[v0] ❌ Missing otp or playbackInfo")
      console.error("[v0] OTP:", otp ? "present" : "missing")
      console.error("[v0] PlaybackInfo:", playbackInfo ? "present" : "missing")
      Alert.alert("Xato", "Yuklab olish uchun kerakli ma'lumotlar yetishmayapti.")
      return
    }

    if (isDownloading) {
      console.warn("[v0] ⚠️ Download already in progress")
      Alert.alert("Ogohlantirish", "Yuklab olish jarayoni allaqachon boshlangan.")
      return
    }

    if (isIOS && !isIOSModuleAvailable) {
      console.warn("[v0] ⚠️ iOS modules not available")
      console.warn("[v0] OfflineDownload available:", OfflineDownload.isAvailable())
      console.warn("[v0] ScreenSecurity available:", ScreenSecurity.isAvailable())
      Alert.alert(
        "iOS Module kerak",
        "Yuklab olish uchun iOS native modullari o'rnatilishi kerak.\n\nQo'llanma: ios/INSTALLATION.md faylida ko'ring.",
        [{ text: "OK" }],
      )
      return
    }

    console.log("[v0] ✅ All checks passed, starting download...")
    console.log("[v0] VideoId:", videoId)
    console.log("[v0] Title:", title)
    setIsDownloading(true)

    try {
      if (isIOS) {
        console.log("[v0] 📱 iOS download path")
        console.log("[v0] Calling OfflineDownload.downloadVideo...")
        const result = await OfflineDownload.downloadVideo(String(videoId), otp, playbackInfo)
        console.log("[v0] ✅ Download initiated:", result)

        mediaIdRef.current = result.downloadId
        console.log("[v0] MediaId set to:", result.downloadId)

        setDownloadStatus({
            mediaInfo: { mediaId: result.downloadId, title },
            status: result.status as any,
            downloadPercent: 0,
            enableAutoResume: true,
            reason: "",
            reasonDescription: "",
            poster: "",
        } as unknown as DownloadStatus)

        console.log("[v0] Download status updated")
      } else {
        console.log("[v0] 🤖 Android download path")
        console.log("[v0] Getting download options...")
        const { downloadOptions, enqueue } = await VdoDownload.getDownloadOptions({
          otp,
          playbackInfo,
        })

        console.log("[v0] ✅ Download options received")
        console.log("[v0] MediaId:", downloadOptions.mediaInfo.mediaId)
        console.log("[v0] Available tracks:", downloadOptions.availableTracks.length)

        const selections = getSelection(downloadOptions.availableTracks)
        const mediaIdFromSDK = downloadOptions.mediaInfo.mediaId
        mediaIdRef.current = mediaIdFromSDK

        console.log("[v0] Track selections:", selections)
        console.log("[v0] Enqueueing download...")

        setDownloadStatus({
          mediaInfo: downloadOptions.mediaInfo,
          status: "queued",
          downloadPercent: 0,
          enableAutoResume: "",
          reason: 0,
          reasonDescription: "",
          poster: "",
        })

        await enqueue({ selections })
        console.log("[v0] ✅ Download enqueued successfully")
      }

      console.log("[v0] ✅ Download process completed successfully")
    } catch (err: any) {
      console.error("[v0] ========== DOWNLOAD ERROR ==========")
      console.error("[v0] ❌ Download failed")
      console.error("[v0] Error message:", err.message)
      console.error("[v0] Error stack:", err.stack)
      console.error("[v0] Full error:", err)
      console.error("[v0] ========================================")

      Alert.alert("Xato", err.message || "Yuklab olishda xatolik yuz berdi.")
      setDownloadStatus(null)
    } finally {
      console.log("[v0] Resetting isDownloading flag")
      setIsDownloading(false)
      console.log("[v0] ==========================================")
    }
  }

  const handleCancel = () => {
    const id = mediaIdRef.current
    if (!id) {
      Alert.alert("Xato", "Yuklab olish topilmadi.")
      return
    }

    Alert.alert("Yuklab olishni bekor qilish", "Bekor qilishni istaysizmi?", [
      { text: "Yo'q", style: "cancel" },
      {
        text: "Ha",
        style: "destructive",
        onPress: async () => {
          try {
            if (isIOS && isIOSModuleAvailable) {
              await OfflineDownload.removeDownload(id)
            } else if (isAndroid) {
              await VdoDownload.remove([id])
            }
            setDownloadStatus(null)
            mediaIdRef.current = null
          } catch (err: any) {
            console.error("[v0] Remove failed:", err)
            Alert.alert("Xato", "Bekor qilishda xatolik yuz berdi.")
          }
        },
      },
    ])
  }

  const handlePlayOffline = () => {
    const id = mediaIdRef.current
    if (!id) {
      Alert.alert("Xato", "Video ID topilmadi.")
      return
    }

    if (onPlayOffline) {
      onPlayOffline(id)
    } else {
      Alert.alert(
        "Oflayn tomosha qilish",
        `Video ID: ${id}\n\nBu videoni oflayn rejimda tomosha qilish uchun video player ekraniga o'ting.`,
      )
    }
  }

  useEffect(() => {
    console.log("[v0] Setting up sync interval")
    const interval = setInterval(() => {
      console.log("[v0] Sync interval triggered")
      syncStatus()
    }, 4000)

    console.log("[v0] Running initial sync")
    syncStatus()

    return () => {
      console.log("[v0] Cleaning up sync interval")
      clearInterval(interval)
    }
  }, [syncStatus])

  const renderStatus = () => {
    if (!downloadStatus) {
      return (
        <Text style={[styles.statusText, { fontSize: scaleFont(isMobile ? 12 : 14) }]}>
          Yuklab olishni boshlash uchun tugmani bosing
        </Text>
      )
    }

    let statusText = ""
    let statusIcon = ""

    switch (downloadStatus.status) {
      case "completed":
        statusIcon = "✅"
        statusText = "Muvaffaqiyatli yuklab olindi"
        break
      case "downloading":
        statusIcon = "⬇️"
        statusText = `Yuklab olinmoqda: ${downloadStatus.downloadPercent?.toFixed(1) ?? "0"}%`
        break
      case "queued":
      case "pending":
        statusIcon = "⏳"
        statusText = "Navbatga qo'yildi..."
        break
      case "failed":
        statusIcon = "❌"
        statusText = `Xatolik: ${downloadStatus.reasonDescription || downloadStatus.reason || "Noma'lum xatolik"}`
        break
      default:
        statusIcon = "⚠️"
        statusText = `Status: ${downloadStatus.status}`
    }

    return (
      <View style={{ marginTop: scaleSpacing(8) }}>
        <Text style={[styles.statusText, { fontSize: scaleFont(isMobile ? 12 : 14) }]}>
          {statusIcon} {statusText}
        </Text>
        {downloadStatus.status === "downloading" && (
          <View
            style={[
              styles.progressBarContainer,
              {
                height: isMobile ? 6 : 8,
                marginTop: scaleSpacing(8),
              },
            ]}
          >
            <View style={[styles.progressBarFill, { width: `${downloadStatus.downloadPercent ?? 0}%` }]} />
          </View>
        )}
      </View>
    )
  }

  const isDownloadable = !downloadStatus || downloadStatus.status === "failed" || downloadStatus.status === "removed"
  const buttonWidth = isDesktop ? "60%" : isTabletDevice ? "70%" : "100%"

  return (
    <View
      style={[
        styles.infoContainer,
        {
          paddingHorizontal: scaleSpacing(16),
          flex: 1,
          maxWidth: isSplitLayout ? 800 : 1200,
          alignSelf: "center",
          width: "100%",
          marginTop: top,
          marginBottom: bottom,
          opacity: isScreenCaptured ? 0.3 : 1,
        },
      ]}
    >
      {isScreenCaptured && (
        <View style={styles.captureWarning}>
          <Text style={styles.captureWarningText}>🔒 Ekran yozib olish yoki skrinshot aniqlandi</Text>
          <Text style={styles.captureWarningSubtext}>Kontentni himoya qilish uchun ko'rinish cheklangan</Text>
        </View>
      )}

      {isIOS && !isIOSModuleAvailable && (
        <View style={styles.moduleWarning}>
          <Text style={styles.moduleWarningIcon}>⚠️</Text>
          <View style={styles.moduleWarningContent}>
            <Text style={styles.moduleWarningText}>iOS Native Module o'rnatilmagan</Text>
            <Text style={styles.moduleWarningSubtext}>
              Yuklab olish funksiyasi iOS native modullarini talab qiladi.{"\n"}
              O'rnatish qo'llanmasi: <Text style={styles.moduleWarningLink}>ios/INSTALLATION.md</Text>
            </Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={[styles.title, { fontSize: scaleFont(isMobile ? 16 : 18) }]} numberOfLines={2}>
          {title}
        </Text>

        {renderStatus()}

        {isDownloadable && (
          <TouchableOpacity
            onPress={handleDownload}
            disabled={isDownloading}
            style={[
              styles.downloadBtn,
              {
                paddingVertical: isMobile ? 10 : 12,
                width: buttonWidth,
                alignSelf: "center",
                opacity: isDownloading ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.downloadBtnText, { fontSize: scaleFont(isMobile ? 14 : 16) }]}>
              {isDownloading ? "⏳ Yuklanmoqda..." : "⬇️ Yuklab olish"}
            </Text>
          </TouchableOpacity>
        )}

        {downloadStatus?.status === "completed" && (
          <TouchableOpacity
            onPress={handlePlayOffline}
            style={[
              styles.offlineBtn,
              {
                paddingVertical: isMobile ? 10 : 12,
                width: buttonWidth,
                alignSelf: "center",
              },
            ]}
          >
            <Text style={[styles.offlineBtnText, { fontSize: scaleFont(isMobile ? 14 : 16) }]}>
              📺 Oflayn tomosha qilish
            </Text>
          </TouchableOpacity>
        )}

        {(downloadStatus?.status === "downloading" || downloadStatus?.status === "queued") && (
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              styles.cancelBtn,
              {
                paddingVertical: isMobile ? 8 : 10,
                width: buttonWidth,
                alignSelf: "center",
              },
            ]}
          >
            <Text style={[styles.cancelBtnText, { fontSize: scaleFont(isMobile ? 12 : 14) }]}>❌ Bekor qilish</Text>
          </TouchableOpacity>
        )}
      </View>

      {contents && contents.length > 0 && (
        <View style={[styles.contentsSection, { padding: scaleSpacing(12), marginTop: scaleSpacing(16) }]}>
          <Text style={[styles.sectionTitle, { fontSize: scaleFont(16) }]}>Qo'shimcha ma'lumotlar</Text>
          {contents
            .sort((a: ContentItem, b: ContentItem) => (a.orderNumber || 0) - (b.orderNumber || 0))
            .map((item: ContentItem, index: number) => (
              <View
                key={`content-${item.id}-${index}`}
                style={[styles.contentItem, { marginBottom: scaleSpacing(12) }]}
              >
                {item.type === "TEXT" && item.textContent && (
                  <Text style={[styles.contentText, { fontSize: scaleFont(14), lineHeight: scaleFont(20) }]}>
                    {item.textContent.trim()}
                  </Text>
                )}
                {item.type === "IMAGE" && item.downloadUrl && (
                  <TouchableOpacity
                    onPress={() => onImagePress(item.downloadUrl!)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Rasmni to'liq ekranda ko'rish"
                    style={{ width: "100%" }}
                  >
                    <Image
                      source={{ uri: item.downloadUrl }}
                      style={[styles.contentImage, { height: Math.min(containerWidth * 0.5, 400) }]}
                      resizeMode="contain"
                      onError={onImageError}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </View>
      )}

      <Attachments
        id={videoId}
        onImagePress={(index: number, images: string[]) => {
          const imageUrl = images[index - 1]
          if (imageUrl) onImagePress(imageUrl)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  infoContainer: { flex: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  statusText: {
    color: "#475569",
    fontWeight: "500",
  },
  progressBarContainer: {
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  offlineBtn: {
    marginTop: 12,
    backgroundColor: "#10b981",
    borderRadius: 10,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  offlineBtnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  captureWarning: {
    position: "absolute",
    top: "40%",
    left: 20,
    right: 20,
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    padding: 20,
    borderRadius: 12,
    zIndex: 1000,
    alignItems: "center",
  },
  captureWarningText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  captureWarningSubtext: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  contentsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
    color: "#1e293b",
  },
  contentItem: {},
  contentText: {
    color: "#475569",
    lineHeight: 22,
  },
  contentImage: {
    width: "100%",
    borderRadius: 8,
  },
  moduleWarning: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderWidth: 1.5,
    borderColor: "#fbbf24",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  moduleWarningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moduleWarningContent: {
    flex: 1,
  },
  moduleWarningText: {
    color: "#d97706",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  moduleWarningSubtext: {
    color: "#92400e",
    fontSize: 13,
    lineHeight: 19,
  },
  moduleWarningLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
})
