"use client"

import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useWindowDimensions,
  PanResponder,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { X } from "lucide-react-native"
import { useRef } from "react"
import { useScaling } from "../../../hooks/useScaling"

type ImageViewerModalProps = {
  visible: boolean
  imageUrl: string | null
  imageError: boolean
  panY: Animated.Value
  orientation: "portrait" | "landscape"
  onClose: () => void
  onImageError: () => void
}

export const ImageViewerModal = ({
  visible,
  imageUrl,
  imageError,
  panY,
  orientation,
  onClose,
  onImageError,
}: ImageViewerModalProps) => {
  const { width, height } = useWindowDimensions()
  const { top, bottom } = useSafeAreaInsets()
  const { scaleFont, scaleSpacing } = useScaling()

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 200) {
          Animated.timing(panY, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
          }).start(onClose)
        } else {
          Animated.timing(panY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start()
        }
      },
    }),
  ).current

  const imgWidth = orientation === "portrait" ? width : height
  const imgHeight = orientation === "portrait" ? height - top - bottom : width - top - bottom

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.overlay} />
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width,
              height: height - top - bottom,
              transform: [{ translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {imageError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { fontSize: scaleFont(16) }]}>Failed to load image</Text>
            </View>
          ) : (
            imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={[styles.image, { width: imgWidth, height: imgHeight }]}
                resizeMode="contain"
                onError={onImageError}
              />
            )
          )}
        </Animated.View>
        <TouchableOpacity
          style={[styles.closeButton, { top: top + scaleSpacing(10) }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={scaleFont(24)} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    opacity: 0.8,
    zIndex: -1,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "visible",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 999,
    zIndex: 10,
  },
  errorContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  errorText: {
    color: "#e11d48",
  },
})
