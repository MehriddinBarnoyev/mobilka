"use client"

import { useCallback, useState, useRef, useEffect, useMemo } from "react"
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Text,
  Image,
  Modal,
  FlatList,
  TouchableOpacity,
  PixelRatio,
  Platform,
  ActivityIndicator,
  PanResponder,
  Animated,
} from "react-native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../type"
import { VideoPlayer } from "../components/video/videoPlayer"
import ScreenHeader from "../components/core/ScreenHeader"
import VideoInfo from "../components/video/videoInfo"
import { Attachments } from "../components/video/attachments"
import api from "../../core/api/apiService"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRoute } from "@react-navigation/native"
import { isTablet } from "../../utils/responsive"
import { X } from "lucide-react-native"

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
  const { width, height } = useWindowDimensions()
  const isTabletDevice = isTablet()
  const route = useRoute<NativeStackScreenProps<RootStackParamList, "VideoScreen">["route"]>()
  const { top, bottom, left, right } = useSafeAreaInsets()
  const { id, title, coverImageUrl, expirationDate } = route.params
  // If 'contents' is not part of route.params, fetch or define it appropriately
  const contents: ContentItem[] = (route.params as any).contents || []

  const [otp, setOtp] = useState<string | null>(null)
  const [playbackInfo, setPlaybackInfo] = useState<any>(null)
  const [loadingOtp, setLoadingOtp] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [allImages, setAllImages] = useState<string[]>([])
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const orientation = useOrientation()
  const flatListRef = useRef<FlatList<string>>(null)
  const panY = useRef(new Animated.Value(0)).current

  const scaleSpacing = (size: number) => {
    let multiplier: number
    if (width >= 1920) {
      multiplier = 1.4
    } else if (width >= 1440) {
      multiplier = 1.3
    } else if (width >= 1024) {
      multiplier = 1.2
    } else if (width >= 768) {
      multiplier = 1.0
    } else if (width >= 600) {
      multiplier = 0.9
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
    } else if (width >= 768) {
      multiplier = 1.0
    } else if (width >= 600) {
      multiplier = 0.95
    } else {
      multiplier = 0.9
    }
    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier))
  }

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  })

  const closeAnim = Animated.timing(panY, {
    toValue: height,
    duration: 500,
    useNativeDriver: true,
  })

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 200) {
          closeAnim.start(closeCarousel)
        } else {
          resetPositionAnim.start()
        }
      },
    }),
  ).current

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
      console.log(data, "otp info data")

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
    return (contents || [])
      .filter(
        (item: ContentItem) =>
          item.type === "IMAGE" &&
          item.downloadUrl &&
          typeof item.downloadUrl === "string" &&
          item.downloadUrl.trim() !== "",
      )
      .map((item: ContentItem) => item.downloadUrl!)
  }, [contents])

  useEffect(() => {
    console.log("Content Images:", contentImages)
  }, [contentImages])

  useEffect(() => {
    if (selectedImageIndex !== null && allImages.length > 0) {
      const validIndex = Math.min(selectedImageIndex, allImages.length - 1)
      if (validIndex >= 0) {
        flatListRef.current?.scrollToIndex({ index: validIndex, animated: false })
      }
    }
  }, [width, height, selectedImageIndex, allImages.length])

  const handleImagePress = (index: number, images: string[]) => {
    const validImages = images.filter((url) => url && typeof url === "string" && url.trim() !== "")
    if (validImages.length === 0) {
      setError("No valid images to display.")
      setSelectedImageIndex(null)
      return
    }
    setAllImages(validImages)
    setSelectedImageIndex(index >= validImages.length ? 0 : index)
    StatusBar.setHidden(true, "fade")
  }

  const closeCarousel = () => {
    setSelectedImageIndex(null)
    setAllImages([])
    setImageErrors(new Set())
    StatusBar.setHidden(false, "fade")
    panY.setValue(0)
  }

  const handleThumbnailPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
    setSelectedImageIndex(index)
  }

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index))
  }

  const renderCarouselItem = ({ item, index }: { item: string; index: number }) => {
    const imgWidth = orientation === "portrait" ? width : height
    const imgHeight = orientation === "portrait" ? height - top - bottom : width - top - bottom

    return (
      <Animated.View
        style={[
          styles.carouselItem,
          {
            width,
            height: height - top - bottom,
            transform: [{ translateY: panY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {imageErrors.has(index) ? (
          <View style={styles.errorImageContainer}>
            <Text style={[styles.errorText, { fontSize: scaleFont(16) }]}>Failed to load image</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item }}
            style={[styles.carouselImage, { width: imgWidth, height: imgHeight }]}
            resizeMode="contain"
            onError={() => handleImageError(index)}
          />
        )}
      </Animated.View>
    )
  }

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      onPress={() => handleThumbnailPress(index)}
      style={[styles.thumbnailItem, selectedImageIndex === index && styles.selectedThumbnail]}
      disabled={imageErrors.has(index)}
    >
      {imageErrors.has(index) ? (
        <View style={styles.thumbnailError}>
          <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>Error</Text>
        </View>
      ) : (
        <Image
          source={{ uri: item }}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={() => handleImageError(index)}
        />
      )}
    </TouchableOpacity>
  )

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

  const containerWidth = isSplitLayout
    ? Math.min(availableWidth / 2, 900) 
    : Math.min(availableWidth, 1200)

  const playerContainerPadding = scaleSpacing(32)
  const minPlayerWidth = isSplitLayout ? 500 : 300
  const playerWidth = Math.max(
    minPlayerWidth,
    Math.min(containerWidth - playerContainerPadding, isSplitLayout ? 800 : 1000),
  )
  const playerHeight = playerWidth * (9 / 16)

  const renderVideoPlayer = () => (
    <View
      style={[
        styles.playerContainer,
        {
          width: isSplitLayout ? containerWidth : "100%",
          maxWidth: isSplitLayout ? 800 : 1200,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: scaleSpacing(16),
          alignSelf: "center",
        },
      ]}
    >
      {otp && playbackInfo ? (
        <VideoPlayer
          embedInfo={{ otp, playbackInfo, title, id }}
          width={playerWidth}
          height={playerHeight}
          aspectRatio={16 / 9}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: scaleFont(16) }]}>{error || "Video not available."}</Text>
          {coverImageUrl && (
            <Image
              source={{ uri: coverImageUrl }}
              style={[styles.thumbnail, { width: playerWidth, height: playerHeight }]}
              resizeMode="cover"
              onError={() => console.error("Thumbnail image load error")}
            />
          )}
        </View>
      )}
    </View>
  )

  const renderContent = () => (
    <View
      style={[
        styles.infoContainer,
        {
          paddingHorizontal: scaleSpacing(16),
          flex: 1,
          maxWidth: isSplitLayout ? 800 : 1200,
          alignSelf: "center",
          width: "100%",
        },
      ]}
    >
      <VideoInfo title={title} description={""} otp={otp || ""} playbackInfo={playbackInfo} />
      {contents && contents.length > 0 && (
        <View style={[styles.contentsSection, { padding: scaleSpacing(12), marginTop: scaleSpacing(16) }]}>
          <Text style={[styles.sectionTitle, { fontSize: scaleFont(16) }]}>Additional Contents</Text>
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
                    onPress={() => handleImagePress(index, contentImages)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="View image in carousel"
                    style={{ width: "100%" }}
                  >
                    <Image
                      source={{ uri: item.downloadUrl }}
                      style={[styles.contentImage, { height: Math.min(containerWidth * 0.5, 400) }]}
                      resizeMode="contain"
                      onError={() => handleImageError(index)}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </View>
      )}
      <Attachments id={id} onImagePress={(index: number, images: string[]) => handleImagePress(index, images)} />
    </View>
  )

  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom, paddingLeft: left, paddingRight: right }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
      <ScreenHeader title={title} />
      <Modal
        visible={selectedImageIndex !== null}
        transparent={false}
        animationType="fade"
        onRequestClose={closeCarousel}
        statusBarTranslucent
      >
        <View style={styles.carouselContainer}>
          <View style={styles.carouselOverlay} />
          <FlatList
            ref={flatListRef}
            data={allImages}
            renderItem={renderCarouselItem}
            keyExtractor={(item, index) => `carousel-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex || 0}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              setSelectedImageIndex(0)
            }}
            key={orientation}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width)
              setSelectedImageIndex(index)
            }}
          />
          <TouchableOpacity
            style={[styles.carouselCloseButton, { top: top + scaleSpacing(10) }]}
            onPress={closeCarousel}
            activeOpacity={0.7}
          >
            <X size={scaleFont(24)} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={[styles.carouselIndicator, { bottom: bottom + scaleSpacing(80) }]}>
            <Text style={[styles.carouselIndicatorText, { fontSize: scaleFont(14) }]}>
              {selectedImageIndex !== null ? `${selectedImageIndex + 1} / ${allImages.length}` : ""}
            </Text>
          </View>
          <FlatList
            data={allImages}
            renderItem={renderThumbnail}
            keyExtractor={(item, index) => `thumb-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.thumbnailList, { bottom: bottom + scaleSpacing(10) }]}
          />
        </View>
      </Modal>
      {isSplitLayout ? (
        <View style={[styles.splitContainer, { justifyContent: "center", gap: scaleSpacing(24) }]}>
          <View style={[styles.leftColumn, { width: containerWidth }]}>{renderVideoPlayer()}</View>
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
            {renderContent()}
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
          {renderVideoPlayer()}
          {renderContent()}
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
  playerContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
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
  scroll: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
  },
  contentsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e293b",
  },
  contentItem: {},
  contentText: {
    color: "#475569",
  },
  contentImage: {
    width: "100%",
    borderRadius: 8,
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
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    width: "100%",
    height: "100%",
  },
  errorText: {
    color: "#e11d48",
    marginBottom: 8,
  },
  thumbnail: {
    width: "100%",
    borderRadius: 12,
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  carouselOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    opacity: 0.8,
    zIndex: -1,
  },
  carouselItem: {
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "visible",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselCloseButton: {
    position: "absolute",
    right: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 999,
    zIndex: 10,
  },
  carouselIndicator: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 10,
  },
  thumbnailList: {
    position: "absolute",
    width: "100%",
    height: 60,
    zIndex: 10,
  },
  thumbnailItem: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    borderColor: "#fff",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailError: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  errorImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
})
