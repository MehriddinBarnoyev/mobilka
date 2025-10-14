"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useScaling } from "../../hooks/useScaling"

type VideoInfoProps = {
  title: string
  description: string
  otp: string
  playbackInfo: any
}

export default function VideoInfo({ title, description, otp, playbackInfo }: VideoInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { scaleFont, scaleSpacing } = useScaling()

  const MAX_LINES = 3
  const shouldShowButton = description && description.length > 150

  return (
    <View style={[styles.container, { padding: scaleSpacing(16), marginBottom: scaleSpacing(12) }]}>
      <Text style={[styles.title, { fontSize: scaleFont(18), marginBottom: scaleSpacing(8) }]}>{title}</Text>

      {description && description.trim() !== "" && (
        <View style={styles.descriptionContainer}>
          <Text
            style={[styles.description, { fontSize: scaleFont(14), lineHeight: scaleFont(20) }]}
            numberOfLines={isExpanded ? undefined : MAX_LINES}
          >
            {description}
          </Text>

          {shouldShowButton && (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              style={[styles.toggleButton, { marginTop: scaleSpacing(8) }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleButtonText, { fontSize: scaleFont(14) }]}>
                {isExpanded ? "Show Less" : "Show More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontWeight: "bold",
    color: "#1e293b",
  },
  descriptionContainer: {
    marginTop: 4,
  },
  description: {
    color: "#475569",
  },
  toggleButton: {
    alignSelf: "flex-start",
  },
  toggleButtonText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
})
