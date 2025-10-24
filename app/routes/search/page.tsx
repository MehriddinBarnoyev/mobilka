"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {RootStackParamList} from '../../../type';
import {useResponsive} from '../../../hooks/useResponsive';
import {useUser} from '../../../context/UserContext';
import {ApiResponse, TagsItem, Video} from '../../../types/shared';
import api from '../../../core/api/apiService';
import {buildVideoExpirationMap} from '../../../utils/dataTransform';
import {
  BORDER_RADIUS,
  COLORS,
  SPACING,
  TAG_COLORS,
} from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { top, bottom } = useSafeAreaInsets()
  const { isMobile, isTablet, scaleFont } = useResponsive()
  const { user } = useUser()
  const [tags, setTags] = useState<TagsItem[]>([])
  const [videoExpMap, setVideoExpMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  const fetchTags = useCallback(async () => {
    try {
      const res = await api.get<TagsItem[]>("/services/qams/api/tags")
      setTags(res.data)
    } catch (err) {
      console.error("Error fetching tags:", err)
      setError("Failed to load tags.")
    }
  }, [])

  const fetchMedia = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await api.get<ApiResponse>(`/services/videoedums/api/user-accesses/media/${user.id}`)
      const expMap = buildVideoExpirationMap(response.data)
      setVideoExpMap(expMap)
    } catch (err) {
      console.error("Error fetching media:", err)
      setError("Failed to load media data.")
    }
  }, [user?.id])

  const fetchData = useCallback(async () => {
    await Promise.all([fetchTags(), fetchMedia()])
  }, [fetchTags, fetchMedia])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchData()
      setLoading(false)
    }
    init()
  }, [user?.id, fetchData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const handleTagPress = useCallback(
    async (tag: string, tagId: number) => {
      if (!user?.id) {
        Alert.alert("Error", "User ID is not available. Please log in.")
        return
      }

      const payload = {
        tagIds: [tagId],
        userId: user.id,
      }

      try {
        setSearchLoading(true)
        const res = await api.post("services/videoedums/api/videos/search", payload)

        if (!res.data || res.data.length === 0) {
          Alert.alert("No videos found for this tag.")
          return
        }

        const videosWithExp: Video[] = res.data
          .map((v: any) => ({
            ...v,
            name: v.title,
            coverImageUrl: v.coverImgUrl,
            expirationDate: videoExpMap.get(v.id) || "",
          }))
          .filter((v: Video) => v.expirationDate !== "")

        if (videosWithExp.length === 0) {
          Alert.alert("No accessible videos found with valid expiration.")
          return
        }

        navigation.navigate("SearchedVideos", {
          title: `#${tag}`,
          videos: videosWithExp,
        })
      } catch (err) {
        console.error("Failed to fetch videos:", err)
        Alert.alert("Failed to fetch videos.")
      } finally {
        setSearchLoading(false)
      }
    },
    [navigation, user, videoExpMap],
  )

  const filteredTags = useMemo(
    () =>
      tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchText.toLowerCase()) ||
          tag.description?.toLowerCase().includes(searchText.toLowerCase()),
      ),
    [tags, searchText],
  )

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: top, paddingBottom: bottom }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { fontSize: scaleFont(16) }]}>Loading tags...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.centered, { paddingTop: top, paddingBottom: bottom }]}>
        <Text style={[styles.errorText, { fontSize: scaleFont(16) }]}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null)
            setLoading(true)
            fetchData().then(() => setLoading(false))
          }}
        >
          <Text style={[styles.retryText, { fontSize: scaleFont(15) }]}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (tags.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: top, paddingBottom: bottom }]}>
        <Text style={[styles.emptyText, { fontSize: scaleFont(16) }]}>No tags found.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {searchLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { fontSize: scaleFont(16) }]}>Searching videos...</Text>
        </View>
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: top, paddingBottom: bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[styles.title, { fontSize: scaleFont(isMobile ? 24 : 28) }]}>Explore by Tags</Text>

        <View style={[styles.searchContainer, { marginBottom: isMobile ? SPACING.lg : SPACING.xl }]}>
          <View style={[styles.searchBox, { paddingVertical: isMobile ? SPACING.sm : SPACING.md }]}>
            <Icon name="search-outline" size={scaleFont(18)} color="#888" style={{ marginRight: SPACING.md }} />
            <TextInput
              style={[styles.searchInput, { fontSize: scaleFont(15) }]}
              placeholder="Search tags..."
              placeholderTextColor="#999"
              onChangeText={setSearchText}
              value={searchText}
            />
          </View>
        </View>

        <View style={[styles.tagsGrid, { gap: isMobile ? SPACING.md : SPACING.lg }]}>
          {filteredTags.map((tag, index) => {
            const color = TAG_COLORS[index % TAG_COLORS.length]
            const iconBgColor = color + "1A"

            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => handleTagPress(tag.name, tag.id)}
                style={[styles.tagCard, { width: isTablet ? "30%" : isMobile ? "48%" : "45%" }]}
                activeOpacity={0.85}
                disabled={searchLoading}
              >
                <View style={styles.tagHeader}>
                  <Text style={[styles.tagName, { color, fontSize: scaleFont(isMobile ? 15 : 16) }]}>#{tag.name}</Text>
                  <View
                    style={[
                      styles.tagIcon,
                      {
                        backgroundColor: iconBgColor,
                        width: scaleFont(30),
                        height: scaleFont(30),
                        borderRadius: scaleFont(15),
                      },
                    ]}
                  >
                    <Icon name="pricetag" size={scaleFont(16)} color={color} />
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: SPACING.xl,
    color: COLORS.text.primary,
    alignSelf: "flex-start",
  },
  searchContainer: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 1200,
  },
  tagCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  tagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagName: {
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  tagIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: "#666",
  },
  errorText: {
    color: "#E74C3C",
    textAlign: "center",
  },
  retryText: {
    marginTop: SPACING.md,
    color: "#3498DB",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#777",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
})
