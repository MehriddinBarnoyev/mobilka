import { useWindowDimensions, PixelRatio } from "react-native"
import {FONT_SIZES, SPACING} from '../app/constants/theme';

export const useResponsive = () => {
  const { width } = useWindowDimensions()
  const isMobile = width < 600
  const isTablet = width >= 600 && width < 1024

  const scaleFont = (size: number) => {
    return Math.round(PixelRatio.roundToNearestPixel(size))
  }

  const getSpacing = (key: keyof typeof SPACING) => {
    return isMobile ? SPACING[key] * 0.8 : SPACING[key]
  }

  const getFontSize = (key: keyof typeof FONT_SIZES) => {
    return scaleFont(isMobile ? FONT_SIZES[key] - 1 : FONT_SIZES[key])
  }

  return {
    width,
    isMobile,
    isTablet,
    scaleFont,
    getSpacing,
    getFontSize,
  }
}
