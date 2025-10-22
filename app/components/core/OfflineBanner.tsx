"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useNetwork } from "../../../hooks/useNetwork"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../../type"
import { useEffect, useRef } from "react"

const { width } = Dimensions.get("window")

export const OfflineBanner: React.FC = () => {
  const { isConnected, isOfflineMode } = useNetwork()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  // Animation values
  const slideAnim = useRef(new Animated.Value(-200)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isConnected || isOfflineMode) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isConnected, isOfflineMode])

  if (isConnected && !isOfflineMode) {
    return null
  }

  const handleDownloadsPress = () => {
    navigation.navigate("MyDownloads")
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Background gradient effect using layered views */}
      <View style={styles.gradientLayer1} />
      <View style={styles.gradientLayer2} />

      {/* Content */}
      <View style={styles.content}>
        {/* Icon container with glow effect */}
        <View style={styles.iconContainer}>
          <View style={styles.iconGlow} />
          <Icon name="cloud-offline" size={width < 600 ? 24 : 28} color="#FFFFFF" />
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Oflayn rejim</Text>
          <Text style={styles.description}>
            Siz hozirda internetga ulanmagansiz. Yuklab olingan kontentni istalgan vaqtda ko‘rishingiz mumkin!
          </Text>
        </View>

        {/* Downloads button */}
        <TouchableOpacity style={styles.button} onPress={handleDownloadsPress} activeOpacity={0.8}>
          <View style={styles.buttonContent}>
            <Icon name="download" size={width < 600 ? 16 : 18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Yuklab olinganlar</Text>
          </View>
          <View style={styles.buttonGlow} />
        </TouchableOpacity>
      </View>

      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    minHeight: width < 600 ? 100 : 120,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#09ab67ff",
  },
  gradientLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#62cb9fff",
    opacity: 0.7,
  },
  content: {
    position: "relative",
    flexDirection: width < 600 ? "column" : "row",
    alignItems: "center",
    paddingHorizontal: width < 600 ? 16 : 20,
    paddingVertical: width < 600 ? 16 : 20,
    gap: width < 600 ? 12 : 16,
    zIndex: 2,
  },
  iconContainer: {
    position: "relative",
    width: width < 600 ? 48 : 56,
    height: width < 600 ? 48 : 56,
    borderRadius: width < 600 ? 24 : 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  iconGlow: {
    position: "absolute",
    width: width < 600 ? 48 : 56,
    height: width < 600 ? 48 : 56,
    borderRadius: width < 600 ? 24 : 28,
    backgroundColor: "#FFFFFF",
    opacity: 0.2,
  },
  textContainer: {
    flex: 1,
    gap: width < 600 ? 3 : 4,
    alignItems: width < 600 ? "center" : "flex-start",
  },
  title: {
    fontSize: width < 600 ? 16 : 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    textAlign: width < 600 ? "center" : "left",
  },
  description: {
    fontSize: width < 600 ? 12 : 13,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: width < 600 ? 16 : 18,
    textAlign: width < 600 ? "center" : "left",
  },
  button: {
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: width < 600 ? 12 : 16,
    paddingVertical: width < 600 ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: width < 600 ? 4 : 6,
  },
  buttonIcon: {
    marginRight: width < 600 ? 1 : 2,
  },
  buttonText: {
    fontSize: width < 600 ? 13 : 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    opacity: 0.1,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: width < 600 ? 80 : 100,
    height: width < 600 ? 80 : 100,
    borderRadius: width < 600 ? 40 : 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    zIndex: 1,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: width < 600 ? 100 : 120,
    height: width < 600 ? 100 : 120,
    borderRadius: width < 600 ? 50 : 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 1,
  },
})
