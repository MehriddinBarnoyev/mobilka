"use client"

import React, { useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useNetwork } from "../../../hooks/useNetwork"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../../type"
import { scale, verticalScale, moderateScale } from "react-native-size-matters"

const { width } = Dimensions.get("window")

export const OfflineBanner: React.FC = () => {
  const { isConnected, isOfflineMode } = useNetwork()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
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

  const handleDownloadsPress = () => navigation.navigate("MyDownloads")

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
      ]}
    >
      <View style={styles.gradientLayer1} />
      <View style={styles.gradientLayer2} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconGlow} />
          <Icon name="cloud-offline" size={moderateScale(26)} color="#FFFFFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Offline Rejim</Text>
          <Text style={styles.description}>
            Siz hozirda oflayn rejimdasiz. Har qanday vaqtda yuklab olingan kontentga kirishingiz mumkin!
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleDownloadsPress} activeOpacity={0.8}>
          <View style={styles.buttonContent}>
            <Icon name="download" size={moderateScale(16)} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Yuklanmalar</Text>
          </View>
          <View style={styles.buttonGlow} />
        </TouchableOpacity>
      </View>

      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    minHeight: verticalScale(110),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#09ab67",
  },
  gradientLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#62cb9f",
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    gap: scale(10),
    zIndex: 2,
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: scale(25),
    backgroundColor: "#FFFFFF",
    opacity: 0.2,
  },
  textContainer: {
    flex: 1,
    gap: verticalScale(4),
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  description: {
    fontSize: moderateScale(12),
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: moderateScale(16),
  },
  button: {
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  buttonIcon: {
    marginRight: scale(4),
  },
  buttonText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Glow layer behind the button for subtle highlight
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: scale(10),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    opacity: 0.15,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -verticalScale(25),
    right: -scale(25),
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -verticalScale(35),
    left: -scale(15),
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
})
