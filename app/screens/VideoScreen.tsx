"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { StyleSheet, View, ScrollView, StatusBar, useWindowDimensions, Text, ActivityIndicator } from "react-native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../type"
import ScreenHeader from "../components/core/ScreenHeader"
import api from "../../core/api/apiService"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRoute } from "@react-navigation/native"
import VideoInfo from "../components/video/videoInfo"
import { ContentSection } from "../components/video/content-section"
import { VideoPlayerSection } from "../components/video/VideoPlayerSection"
import { ImageViewerModal } from "../components/video/ImageViewerModal"
import { useScaling } from "../../hooks/useScaling"
import { useRef } from "react"
import { Animated } from "react-native"
import { useImageViewer } from "../../hooks/useImageViewer"

const useOrientation = () => {
  const { width, height } = useWindowDimensions()
  return width > height ? "landscape" : "portrait"
}

type ContentItem = {
  id: number
  type: "TEXT" | "IMAGE"
  textContent: string | null
  orderNumber: number | null
  downloadUrl: string | null
  resourceKey?: string | null
}

export default function VideoScreen() {
  const route = useRoute<NativeStackScreenProps<RootStackParamList, "VideoScreen">["route"]>()
  const { top, bottom, left, right } = useSafeAreaInsets()
  const { id, title, coverImageUrl, expirationDate } = route.params
  const contents: ContentItem[] = (route.params as any).contents || []

  const [otp, setOtp] = useState<string | null>(null)
  const [playbackInfo, setPlaybackInfo] = useState<any>(null)
  const [loadingOtp, setLoadingOtp] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { width } = useWindowDimensions()

  const orientation = useOrientation()
  const { scaleFont, scaleSpacing } = useScaling()
  const { selectedImage, imageError, panY, handleImagePress, closeViewer, handleImageError } = useImageViewer()

  const fetchOtp = useCallback(async () => {
    if (!id || !expirationDate) {
      setError("Missing required parameters.")
      setLoadingOtp(false)
      return
    }
    try {
      setLoadingOtp(true)
      setError(null)
      const requestBody = { videoId: id, endDate: expirationDate }
      const response = await api.post("/services/videoedums/api/otp/v2", requestBody)
      const data = response.data

      setOtp(data.otp || data.otpToken)
      setPlaybackInfo(data.playbackInfo || data)
    } catch (error: any) {
      setError("Failed to load video. Please try again.")
    } finally {
      setLoadingOtp(false)
    }
  }, [id, expirationDate])

  useEffect(() => {
    if (!otp && !playbackInfo && !error) {
      fetchOtp()
    }
  }, [fetchOtp, otp, playbackInfo, error])

  const contentImages = useMemo(() => {
    const images = (contents || [])
      .filter(
        (item: ContentItem) =>
          item.type === "IMAGE" &&
          item.downloadUrl &&
          typeof item.downloadUrl === "string" &&
          item.downloadUrl.trim() !== "",
      )
      .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
      .map((item: ContentItem) => item.downloadUrl!)
    console.log("VideoScreen contentImages:", images)
    return images
  }, [contents])

  if (loadingOtp) {
    return (
      <View
        style={[styles.container, { paddingTop: top, paddingBottom: bottom, paddingLeft: left, paddingRight: right }]}
      >
        <ScreenHeader title={title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={scaleFont(40)} color="#475569" />
          <Text style={[styles.loadingText, { fontSize: scaleFont(16), marginTop: scaleSpacing(10) }]}>
            Loading video...
          </Text>
        </View>
      </View>
    )
  }

  const isSplitLayout = orientation === "landscape" && width >= 600
  const availableWidth = width - left - right
  const containerWidth = isSplitLayout ? Math.min(availableWidth / 2, 900) : Math.min(availableWidth, 1200)
  const playerContainerPadding = scaleSpacing(32)
  const minPlayerWidth = isSplitLayout ? 500 : 300
  const playerWidth = Math.max(
    minPlayerWidth,
    Math.min(containerWidth - playerContainerPadding, isSplitLayout ? 800 : 1000),
  )
  const playerHeight = playerWidth * (9 / 16)

  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom, paddingLeft: left, paddingRight: right }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
      <ScreenHeader title={title} />

      <ImageViewerModal
        visible={selectedImage !== null}
        imageUrl={selectedImage}
        imageError={imageError}
        panY={panY}
        orientation={orientation}
        onClose={closeViewer}
        onImageError={handleImageError}
      />

      {isSplitLayout ? (
        <View style={[styles.splitContainer, { justifyContent: "center", gap: scaleSpacing(24) }]}>
          <View style={[styles.leftColumn, { width: containerWidth }]}>
            <VideoPlayerSection
              otp={otp}
              playbackInfo={playbackInfo}
              error={error}
              coverImageUrl={coverImageUrl || undefined}
              playerWidth={playerWidth}
              playerHeight={playerHeight}
              containerWidth={containerWidth}
              isSplitLayout={isSplitLayout}
            />
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              {
                paddingTop: scaleSpacing(16),
                paddingBottom: scaleSpacing(16),
                alignItems: "center",
              },
            ]}
            style={[styles.rightColumn, { width: containerWidth }]}
          >
            <ContentSection
              title={title}
              otp={otp}
              playbackInfo={playbackInfo}
              contents={contents}
              contentImages={contentImages}
              videoId={id}
              containerWidth={containerWidth}
              isSplitLayout={isSplitLayout}
              onImagePress={handleImagePress}
              onImageError={handleImageError}
            />
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: scaleSpacing(16),
              paddingBottom: scaleSpacing(16),
              alignItems: "center",
            },
          ]}
          style={styles.scrollView}
        >
          <VideoPlayerSection
            otp={otp}
            playbackInfo={playbackInfo}
            error={error}
            coverImageUrl={coverImageUrl || undefined}
            playerWidth={playerWidth}
            playerHeight={playerHeight}
            containerWidth={containerWidth}
            isSplitLayout={isSplitLayout}
          />
           

          <ContentSection
            title={title}
            otp={otp}
            playbackInfo={playbackInfo}
            contents={contents}
            contentImages={contentImages}
            videoId={id}
            containerWidth={containerWidth}
            isSplitLayout={isSplitLayout}
            onImagePress={handleImagePress}
            onImageError={handleImageError}
          />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafbfc",
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftColumn: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightColumn: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  loadingText: {
    color: "#475569",
  },
})