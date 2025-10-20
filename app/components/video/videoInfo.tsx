"use client"

import { useEffect, useState, useCallback } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Alert, useWindowDimensions } from "react-native"
import { VdoDownload } from "vdocipher-rn-bridge"
import type { DownloadStatus, Track } from "vdocipher-rn-bridge/type"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PixelRatio } from "react-native"
import { isTablet } from "../../../utils/responsive"

interface VideoInfoProps {
  title: string
  description: string
  otp: string
  playbackInfo: string
}

function VideoInfo({ title, description, otp, playbackInfo }: VideoInfoProps) {
  const [realMediaId, setRealMediaId] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null)
  const { width } = useWindowDimensions()
  const { top, bottom } = useSafeAreaInsets()

  const isMobile = width < 600
  const isTabletDevice = isTablet()
  const isDesktop = width >= 1024

  const resolveMediaId = useCallback(() => realMediaId, [realMediaId])

  const scaleFont = (size: number) => {
    let multiplier: number
    if (width >= 1920) {
      multiplier = 1.3
    } else if (width >= 1440) {
      multiplier = 1.2
    } else if (width >= 1024) {
      multiplier = 1.1
    } else if (width >= 768) {
      multiplier = 1.0
    } else if (width >= 600) {
      multiplier = 0.95
    } else {
      multiplier = 0.9
    }
    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier))
  }

  const initialCheck = useCallback(() => {
    VdoDownload.getDownloadOptions({ otp, playbackInfo })
      .then(({ downloadOptions }: any) => {
        const actualMediaId = downloadOptions.mediaInfo.mediaId
        setRealMediaId(actualMediaId)

        return VdoDownload.query().then((statusList: any) => {
          const match = statusList.find((s: any) => s.mediaInfo.mediaId === actualMediaId)

          if (match) {
            setDownloadStatus(match)
          }
        })
      })
      .catch((err: any) => console.warn("[initialCheck] Failed to retrieve download info:", err))
  }, [otp, playbackInfo])

  const syncStatus = useCallback(() => {
    const id = resolveMediaId()
    if (!id) return

    VdoDownload.query()
      .then((statusList: DownloadStatus[]) => {
        const found = statusList.find((s) => s.mediaInfo.mediaId === id)
        setDownloadStatus(found || null)
      })
      .catch((err: any) => console.warn("[VideoInfo] Sync error:", err))
  }, [resolveMediaId])

  useEffect(() => {
    let isMounted = true
    initialCheck()

    const interval = setInterval(syncStatus, 3000)

    const createListener = (event: string, handler: (mediaId: string, status?: DownloadStatus) => void) => {
      return VdoDownload.addEventListener(event, (id: string, status: DownloadStatus) => {
        if (id === resolveMediaId() && isMounted) {
          handler(id, status)
        }
      })
    }

    const unsubChanged = createListener("onChanged", (_, status) => setDownloadStatus({ ...status! }))
    const unsubCompleted = createListener("onCompleted", (_, status) => setDownloadStatus({ ...status! }))
    const unsubQueued = createListener("onQueued", (_, status) => setDownloadStatus({ ...status! }))
    const unsubFailed = createListener("onFailed", (_, status) => setDownloadStatus({ ...status! }))
    const unsubDeleted = VdoDownload.addEventListener("onDeleted", (id: any) => {
      if (id === resolveMediaId() && isMounted) {
        setDownloadStatus(null)
      }
    })

    return () => {
      isMounted = false
      clearInterval(interval)
      unsubChanged()
      unsubCompleted()
      unsubQueued()
      unsubFailed()
      unsubDeleted()
    }
  }, [syncStatus, initialCheck])

  const getSelection = (tracks: Track[]) => {
    const selections: number[] = []
    const video = tracks.findIndex((t) => t.type === "video")
    const audio = tracks.findIndex((t) => t.type === "audio")
    if (video !== -1) selections.push(video)
    if (audio !== -1) selections.push(audio)
    return selections
  }

  const handleDownload = () => {
    VdoDownload.getDownloadOptions({ otp, playbackInfo })
      .then(({ downloadOptions, enqueue }: any) => {
        const selections = getSelection(downloadOptions.availableTracks)
        const mediaIdFromSDK = downloadOptions.mediaInfo.mediaId

        setRealMediaId(mediaIdFromSDK)
        setDownloadStatus({
          mediaInfo: downloadOptions.mediaInfo,
          status: "queued",
          downloadPercent: 0,
          enableAutoResume: true,
          reason: "",
          reasonDescription: "",
          poster: "",
        })

        return enqueue({ selections })
      })
      .then(() => {
        syncStatus()
      })
      .catch((err: any) => console.warn("[VideoInfo] Download start failed:", err))
  }

  const handleCancel = () => {
    const id = resolveMediaId()
    if (!id) return

    Alert.alert("Yuklab olishni bekor qilish", "Bekor qilishni istayotganingizga ishonchingiz komilmi?", [
      { text: "Yo'q", style: "cancel" },
      {
        text: "Ha",
        style: "destructive",
        onPress: () =>
          VdoDownload.remove([id])
            .then(() => console.log("[VideoInfo] Download removed"))
            .catch((err: any) => console.warn("[VideoInfo] Remove failed:", err)),
      },
    ])
  }

  const renderStatus = () => {
    if (!downloadStatus) {
      return (
        <Text style={[styles.statusText, { fontSize: scaleFont(isMobile ? 12 : 14) }]}>
          📂 Yuklab olishni boshlash uchun bosing
        </Text>
      )
    }

    let statusText = ""
    switch (downloadStatus.status) {
      case "completed":
        statusText = "✅ Muvaffaqiyatli yuklab olindi"
        break
      case "downloading":
        statusText = `⬇️ Yuklab olinmoqda: ${downloadStatus.downloadPercent?.toFixed(1) ?? "0"}%`
        break
      case "queued":
      case "pending":
        statusText = "⏳ Navbatga qo'yildi..."
        break
      case "failed":
        statusText = `❌ Muvaffaqiyatsiz tugadi: ${downloadStatus.reasonDescription || downloadStatus.reason}`
        break
      default:
        statusText = `⚠️ Status: ${downloadStatus.status}`
    }

    return (
      <View>
        <Text style={[styles.statusText, { fontSize: scaleFont(isMobile ? 12 : 14) }]}>{statusText}</Text>
        {downloadStatus.status === "downloading" && (
          <View
            style={[
              styles.progressBarContainer,
              {
                height: isMobile ? 6 : 8,
                width: "100%",
                maxWidth: isDesktop ? 600 : "100%",
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
        styles.card,
        {
          padding: isMobile ? 12 : isTabletDevice ? 16 : 20,
          marginTop: top,
          marginBottom: bottom,
          maxWidth: isDesktop ? 1200 : "100%",
          alignSelf: "center",
          width: "100%",
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { fontSize: scaleFont(isMobile ? 16 : 18) }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.meta, { fontSize: scaleFont(isMobile ? 12 : 14) }]}>{description}</Text>
        <View style={{ marginTop: isMobile ? 8 : 10 }}>{renderStatus()}</View>
        {isDownloadable && (
          <TouchableOpacity
            onPress={handleDownload}
            style={[
              styles.downloadBtn,
              {
                paddingVertical: isMobile ? 8 : 10,
                width: buttonWidth,
                alignSelf: "center",
              },
            ]}
          >
            <Text style={[styles.downloadBtnText, { fontSize: scaleFont(isMobile ? 14 : 16) }]}>Yuklab olish</Text>
          </TouchableOpacity>
        )}
        {downloadStatus?.status === "completed" && (
          <TouchableOpacity
            disabled
            style={[
              styles.downloadBtn,
              {
                opacity: 0.6,
                paddingVertical: isMobile ? 8 : 10,
                width: buttonWidth,
                alignSelf: "center",
              },
            ]}
          >
            <Text style={[styles.downloadBtnText, { fontSize: scaleFont(isMobile ? 14 : 16) }]}>Yuklab olingan</Text>
          </TouchableOpacity>
        )}
        {downloadStatus?.status === "downloading" && (
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              styles.cancelBtn,
              {
                paddingVertical: isMobile ? 6 : 8,
                width: buttonWidth,
                alignSelf: "center",
              },
            ]}
          >
            <Text style={[styles.cancelBtnText, { fontSize: scaleFont(isMobile ? 14 : 16) }]}>Bekor qilish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default VideoInfo

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  meta: {
    color: "#7f8c8d",
    fontWeight: "500",
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: "#3498db",
    borderRadius: 8,
  },
  downloadBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  statusText: {
    color: "#2c3e50",
    fontWeight: "500",
  },
  progressBarContainer: {
    backgroundColor: "#eee",
    borderRadius: 4,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 4,
  },
})
