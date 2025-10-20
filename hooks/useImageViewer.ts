"use client"

import { useState, useRef, useCallback } from "react"
import { Animated, StatusBar, useWindowDimensions } from "react-native"

export const useImageViewer = () => {
  const { height } = useWindowDimensions()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const panY = useRef(new Animated.Value(0)).current
  const isClosingRef = useRef(false)

  const handleImagePress = useCallback((imageUrl: string) => {
    if (isClosingRef.current || !imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return
    }

    setSelectedImage(imageUrl)
    setImageError(false)
    StatusBar.setHidden(true, "fade")
  }, [])

  const closeViewer = useCallback(() => {
    if (isClosingRef.current) {
      return
    }

    isClosingRef.current = true

    Animated.timing(panY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedImage(null)
      setImageError(false)
      StatusBar.setHidden(false, "fade")
      panY.setValue(0)
      isClosingRef.current = false
    })
  }, [height, panY])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  return {
    selectedImage,
    imageError,
    panY,
    handleImagePress,
    closeViewer,
    handleImageError,
  }
}
