"use client"

import { useEffect, useState, useCallback } from "react"
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
  useWindowDimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../type"
import api from "../../core/api/apiService"
import type { TagsItem } from "../../types/tags"
import type { Group } from "../../types/groups"
import { useUser } from "../../context/UserContext"
import { PixelRatio } from "react-native"
import { isTablet } from "../../utils/responsive" // Assuming this utility exists
import { useNetwork } from "../../hooks/useNetwork"

const tagColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#00D2D3",
  "#FF6348",
]

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface ApiResponse {
  groups: {
    content: {
      id: number
      name: string
      playlists: {
        id: number
        title: string
        videos: {
          id: number
          title: string
          url: string | null
          coverImgUrl: string | null
          contents: {
            id: number
            type: "TEXT" | "IMAGE"
            textContent: string | null
            resourceKey: string | null
            orderNumber: number | null
          }[]
        }[]
      }[]
      videos: {
        id: number
        title: string
        url: string | null
        coverImgUrl: string | null
        contents: {
          id: number
          type: "TEXT" | "IMAGE"
          textContent: string | null
          resourceKey: string | null
          orderNumber: number | null
        }[]
      }[]
    }
    expirationDate: string
    type: "GROUP"
  }[]
  playlists: {
    content: {
      id: number
      title: string
      videos: {
        orderNumber: any
        id: number
        title: string
        url: string | null
        coverImgUrl: string | null
        contents: {
          id: number
          type: "TEXT" | "IMAGE"
          textContent: string | null
          resourceKey: string | null
          orderNumber: number | null
        }[]
      }[]
    }
    expirationDate: string
    type: "PLAYLIST"
  }[]
  videos: {
    content: {
      id: number
      title: string
      url: string | null
      coverImgUrl: string | null
      contents: {
        id: number
        type: "TEXT" | "IMAGE"
        textContent: string | null
        resourceKey: string | null
        orderNumber: number | null
      }[]
    }
    expirationDate: string
    type: "VIDEO"
  }[]
}

type Video = {
  id: number
  orderNumber: number
  name: string
  url: string | null
  expirationDate: string
  type: "VIDEO"
  coverImageUrl: string | null
  contents: {
    id: number
    type: "TEXT" | "IMAGE"
    textContent: string | null
    resourceKey: string | null
    orderNumber: number | null
  }[]
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { width } = useWindowDimensions() // Dynamic screen width
  const { top, bottom } = useSafeAreaInsets() // Safe area insets
  const isMobile = width < 600
  const isTabletDevice = isTablet()
  const { user } = useUser()
  const { isConnected, isOfflineMode } = useNetwork()

  const [tags, setTags] = useState<TagsItem[]>([])
  const [videoGroups, setVideoGroups] = useState<Group[]>([])
  const [videoExpMap, setVideoExpMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  // Font scaling based on screen density
  const scaleFont = (size: number) => {
    return Math.round(PixelRatio.roundToNearestPixel(size))
  }

  const isNotExpired = (expirationDate: string, currentDate: Date): boolean => {
    const expDate = new Date(expirationDate)
    return expDate >= currentDate
  }

  // Fetch Tags
  const fetchTags = async () => {
    try {
      const res = await api.get("/services/qams/api/tags")
      setTags(res.data)
    } catch (err) {
      console.error("Error fetching tags:", err)
      setError("Failed to load tags.")
    }
  }

  // Fetch Groups
  const fetchGroups = async () => {
    try {
      const res = await api.get("/services/videoedums/api/edu-groups/mobile")
      setVideoGroups(res.data)
    } catch (err) {
      console.error("Error fetching groups:", err)
      setError("Failed to load groups.")
    }
  }

  // Fetch User Media for Expiration Map
  const fetchMedia = async () => {
    if (!user?.id) return

    try {
      const response = await api.get<ApiResponse>(`/services/videoedums/api/user-accesses/media/${user.id}`)
      const data = response.data

      const currentDate = new Date()
      const expMap = new Map<number, string>()

      data.groups
        .filter((group) => isNotExpired(group.expirationDate, currentDate))
        .forEach((group) => {
          group.content.playlists.forEach((playlist) => {
            playlist.videos.forEach((video) => {
              const existing = expMap.get(video.id)
              const newExp = group.expirationDate
              if (!existing || new Date(newExp) > new Date(existing)) {
                expMap.set(video.id, newExp)
              }
            })
          })
          group.content.videos.forEach((video) => {
            const existing = expMap.get(video.id)
            const newExp = group.expirationDate
            if (!existing || new Date(newExp) > new Date(existing)) {
              expMap.set(video.id, newExp)
            }
          })
        })

      data.playlists
        .filter((playlist) => isNotExpired(playlist.expirationDate, currentDate))
        .forEach((playlist) => {
          playlist.content.videos.forEach((video) => {
            const existing = expMap.get(video.id)
            const newExp = playlist.expirationDate
            if (!existing || new Date(newExp) > new Date(existing)) {
              expMap.set(video.id, newExp)
            }
          })
        })

      data.videos
        .filter((video) => isNotExpired(video.expirationDate, currentDate))
        .forEach((video) => {
          const existing = expMap.get(video.content.id)
          const newExp = video.expirationDate
          if (!existing || new Date(newExp) > new Date(existing)) {
            expMap.set(video.content.id, newExp)
          }
        })

      setVideoExpMap(expMap)
    } catch (err) {
      console.error("Error fetching media:", err)
      setError("Failed to load media data.")
    }
  }

  // Combined fetch on mount
  const fetchData = async () => {
    await Promise.all([fetchTags(), fetchGroups(), fetchMedia()])
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchData()
      setLoading(false)
    }
    init()
  }, [user?.id])

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [])

  // Handle Tag Click
  const handleTagPress = useCallback(
    async (tag: string, tagId: number) => {
      if (videoGroups.length === 0) {
        Alert.alert("No groups available for filtering videos.")
        return
      }

      if (!user?.id) {
        Alert.alert("Error", "User ID is not available. Please log in.")
        return
      }
      const payload = {
        tagIds: [tagId],
        userId: user.id,
      }
      const url = `services/videoedums/api/videos/search`
      try {
        setSearchLoading(true)
        const res = await api.post(url, payload)
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

        navigation.navigate('SearchedVideos', {
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
    [videoGroups, navigation, user, videoExpMap],
  )

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: top, paddingBottom: bottom }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
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
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={[styles.loadingText, { fontSize: scaleFont(16) }]}>Searching videos...</Text>
        </View>
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: top, paddingBottom: bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[styles.title, { fontSize: scaleFont(isMobile ? 24 : 28) }]}>Explore by Tags</Text>

        <View style={[styles.searchContainer, { marginBottom: isMobile ? 16 : 20 }]}>
          <View style={[styles.searchBox, { paddingVertical: isMobile ? 8 : 10 }]}>
            <Icon name="search-outline" size={scaleFont(18)} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { fontSize: scaleFont(15) }]}
              placeholder="Search tags..."
              placeholderTextColor="#999"
              onChangeText={(text) => setSearchText(text)}
              value={searchText}
            />
          </View>
        </View>

        <View style={[styles.tagsGrid, { gap: isMobile ? 8 : 12 }]}>
          {tags
            .filter(
              (tag) =>
                tag.name.toLowerCase().includes(searchText.toLowerCase()) ||
                tag.description?.toLowerCase().includes(searchText.toLowerCase()),
            )
            .map((tag, index) => {
              const color = tagColors[index % tagColors.length]
              const iconBgColor = color + "1A"

              return (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => handleTagPress(tag.name, tag.id)}
                  style={[styles.tagCard, { width: isTabletDevice ? "30%" : isMobile ? "48%" : "45%" }]}
                  activeOpacity={0.85}
                  disabled={searchLoading}
                >
                  <View style={styles.tagHeader}>
                    <Text style={[styles.tagName, { color, fontSize: scaleFont(isMobile ? 15 : 16) }]}>
                      #{tag.name}
                    </Text>
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
    paddingHorizontal: 16,
    paddingBottom: 50,
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 20,
    color: "#1E293B",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    color: "#111",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 1200,
  },
  tagCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
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
    color: "#1E293B",
  },
  tagIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  tagDescription: {
    marginTop: 8,
    color: "#64748B",
    lineHeight: 18,
  },
  tagDescriptionMuted: {
    marginTop: 8,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "#E74C3C",
    textAlign: "center",
  },
  retryText: {
    marginTop: 10,
    color: "#3498DB",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#777",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
})
