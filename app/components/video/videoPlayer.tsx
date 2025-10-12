"use client"

import { useMemo } from "react"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import { VdoPlayerView } from "vdocipher-rn-bridge"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { isTablet } from "../../../utils/responsive"

interface VideoPlayerProps {
  embedInfo: any
  width?: number
  aspectRatio?: number
  height?: number
}

export function VideoPlayer({ embedInfo, width, aspectRatio = 16 / 9, height }: VideoPlayerProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const { top, bottom, left, right } = useSafeAreaInsets()
  const isTabletDevice = isTablet()

  const playerWidth = useMemo(() => {
    if (width) return width

    const availableWidth = windowWidth - left - right

    let maxWidth: number
    if (windowWidth >= 1920) {
      maxWidth = 1400
    } else if (windowWidth >= 1440) {
      maxWidth = 1200
    } else if (windowWidth >= 1024) {
      maxWidth = 900
    } else if (isTabletDevice) {
      maxWidth = Math.min(availableWidth - 40, 800)
    } else {
      maxWidth = availableWidth - 32
    }

    return Math.min(maxWidth, availableWidth - 32)
  }, [width, windowWidth, left, right, isTabletDevice])

  const playerHeight = useMemo(() => {
    if (height) return height

    const calculatedHeight = playerWidth / aspectRatio
    const maxHeight = windowHeight * 0.6

    return Math.min(calculatedHeight, maxHeight)
  }, [height, playerWidth, aspectRatio, windowHeight])

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: top,
          paddingBottom: bottom,
          width: playerWidth,
          height: playerHeight,
          maxWidth: "100%",
        },
      ]}
    >
      <VdoPlayerView
        style={{
          width: playerWidth,
          height: playerHeight,
        }}
        embedInfo={embedInfo}
        showNativeControls={true}
        onInitializationSuccess={() => console.log("init success")}
        onInitializationFailure={(error: any) => console.log("init failure", error)}
        onLoading={() => console.log("loading")}
        onLoaded={() => console.log("loaded")}
        onLoadError={({ errorDescription }: any) => console.log("load error", errorDescription)}
        onError={({ errorDescription }: any) => console.log("error", errorDescription)}
        onTracksChanged={() => console.log("tracks changed")}
        onPlaybackSpeedChanged={(speed: any) => console.log("speed changed to", speed)}
        onEnterFullscreen={() => console.log("onEnterFullscreen")}
        onExitFullscreen={() => console.log("onExitFullscreen")}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14
  },
})
