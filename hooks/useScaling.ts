import { useWindowDimensions, PixelRatio } from "react-native"

export const useScaling = () => {
  const { width } = useWindowDimensions()

  const scaleSpacing = (size: number) => {
    let multiplier: number
    if (width >= 1920) multiplier = 1.4
    else if (width >= 1440) multiplier = 1.3
    else if (width >= 1024) multiplier = 1.2
    else if (width >= 768) multiplier = 1.0
    else if (width >= 600) multiplier = 0.9
    else multiplier = 0.8
    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier))
  }

  const scaleFont = (size: number) => {
    let multiplier: number
    if (width >= 1920) multiplier = 1.3
    else if (width >= 1440) multiplier = 1.2
    else if (width >= 1024) multiplier = 1.1
    else if (width >= 768) multiplier = 1.0
    else if (width >= 600) multiplier = 0.95
    else multiplier = 0.9
    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier))
  }

  return { scaleSpacing, scaleFont }
}
