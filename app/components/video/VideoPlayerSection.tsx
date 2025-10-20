import { View, Text, Image, StyleSheet, Platform } from "react-native"
import { VideoPlayer } from "./videoPlayer"
import { useScaling } from "../../../hooks/useScaling"

type VideoPlayerSectionProps = {
  otp: string | null
  playbackInfo: any
  error: string | null
  coverImageUrl?: string
  playerWidth: number
  playerHeight: number
  containerWidth: number
  isSplitLayout: boolean
}

export const VideoPlayerSection = ({
  otp,
  playbackInfo,
  error,
  coverImageUrl,
  playerWidth,
  playerHeight,
  containerWidth,
  isSplitLayout,
}: VideoPlayerSectionProps) => {
  const { scaleFont, scaleSpacing } = useScaling()

  return (
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
        <VideoPlayer embedInfo={{ otp, playbackInfo }} width={playerWidth} height={playerHeight} aspectRatio={16 / 9} />
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
}

const styles = StyleSheet.create({
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
})
