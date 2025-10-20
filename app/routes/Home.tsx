"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import {
  FlatList,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import api from "../../core/api/apiService"
import auth from "../../utils/auth"
import type { RootStackParamList } from "../../type"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { UserResponse } from "../../types/UserInterface"
import Header from "../components/core/header"
import { OfflineBanner } from "../components/core/OfflineBanner"
import { useNetwork } from "../../hooks/NetworkProvider"

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

type Playlist = {
  id: number
  name: string
  expirationDate: string
  type: "PLAYLIST"
  videos: Video[]
}

type Group = {
  id: number
  name: string
  expirationDate: string
  type: "GROUP"
  playlists: Playlist[]
  videos: Video[]
}

export type Item = Group | Playlist | Video

interface ApiResponse {
  groups: {
    content: {
      id: number
      name: string
      playlists: {
        id: number
        title: string
        videos: {
          orderNumber: number
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
        orderNumber: number
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
      orderNumber: number
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

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { top } = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { isConnected } = useNetwork()

  const isMobile = width < 600
  const SPACING = isMobile ? 8 : 12
  const numColumns = 1
  const thumbnailSize = isMobile ? 36 : 40
  const iconSize = isMobile ? 20 : 24
  const fontSizeCell = isMobile ? 13 : 14
  const fontSizeType = isMobile ? 12 : 14
  const paddingHorizontal = isMobile ? 12 : 16
  const paddingVertical = isMobile ? 12 : 16

  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const isFetchingRef = useRef(false)

  console.log(`is connected = ${isConnected} `)

  const mountedRef = useRef(true)
  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeSetState = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
    return (value: React.SetStateAction<T>) => {
      if (mountedRef.current) setter(value)
    }
  }, [])

  const setItemsSafe = safeSetState(setItems)
  const setUserSafe = safeSetState(setUser)
  const setLoadingSafe = safeSetState(setLoading)
  const setRefreshingSafe = safeSetState(setRefreshing)

  const isNotExpired = (expirationDate: string, currentDate: Date): boolean => {
    const expDate = new Date(expirationDate)
    return expDate >= currentDate
  }

  const fetchUserThenData = useCallback(
    async (isRefresh = false) => {
      if (isFetchingRef.current && !isRefresh) return
      isFetchingRef.current = true

      try {
        if (!isRefresh) setLoadingSafe(true)

        const userRes = await api.get<UserResponse>("/services/userms/api/account")
        const u = userRes.data
        setUserSafe(u)

        if (!u?.passwordReset) {
          navigation.replace("ChangePasswordForce")
          isFetchingRef.current = false
          return
        }

        const userId = u.id
        const response = await api.get<ApiResponse>(
          `https://assoodiq.devops.uz/services/videoedums/api/user-accesses/media/${userId}`,
        )
        const data = response.data

        const currentDate = new Date()

        const videoMap = new Map<number, { url: string | null; coverImgUrl: string | null; contents: any[] }>()
        data.videos.forEach((video) => {
          videoMap.set(video.content.id, {
            url: video.content.url,
            coverImgUrl: video.content.coverImgUrl,
            contents: video.content.contents.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)), // Sort contents by orderNumber
          })
        })

        const uniqueGroups = new Map<number, Group>()
        data.groups
          .filter((group) => isNotExpired(group.expirationDate, currentDate))
          .forEach((group) => {
            const existing = uniqueGroups.get(group.content.id)
            if (!existing) {
              uniqueGroups.set(group.content.id, {
                id: group.content.id,
                name: group.content.name,
                expirationDate: group.expirationDate,
                type: "GROUP" as const,
                playlists: group.content.playlists
                  .map((playlist) => ({
                    id: playlist.id,
                    name: playlist.title,
                    expirationDate: group.expirationDate,
                    type: "PLAYLIST" as const,
                    videos: playlist.videos
                      .map((video) => ({
                        id: video.id,
                        name: video.title,
                        url: videoMap.get(video.id)?.url || video.url,
                        expirationDate: group.expirationDate,
                        type: "VIDEO" as const,
                        coverImageUrl: videoMap.get(video.id)?.coverImgUrl || video.coverImgUrl,
                        contents: videoMap.get(video.id)?.contents || video.contents,
                        orderNumber: video.orderNumber || 0,
                      }))
                      .sort((a, b) => {
                        return a.orderNumber - b.orderNumber
                      }),
                  }))
                  .sort((a, b) => a.id - b.id),
                videos: group.content.videos
                  .map((video) => ({
                    id: video.id,
                    name: video.title,
                    url: videoMap.get(video.id)?.url || video.url,
                    expirationDate: group.expirationDate,
                    type: "VIDEO" as const,
                    coverImageUrl: videoMap.get(video.id)?.coverImgUrl || video.coverImgUrl,
                    contents: videoMap.get(video.id)?.contents || video.contents,
                    orderNumber: video.orderNumber || 0,
                  }))
                  .sort((a, b) => {
                    return a.orderNumber - b.orderNumber
                  }), // Sort videos by orderNumber
              })
            } else if (new Date(group.expirationDate) > new Date(existing.expirationDate)) {
              uniqueGroups.set(group.content.id, {
                id: group.content.id,
                name: group.content.name,
                expirationDate: group.expirationDate,
                type: "GROUP" as const,
                playlists: group.content.playlists
                  .map((playlist) => ({
                    id: playlist.id,
                    name: playlist.title,
                    expirationDate: group.expirationDate,
                    type: "PLAYLIST" as const,
                    videos: playlist.videos
                      .map((video) => ({
                        id: video.id,
                        name: video.title,
                        url: videoMap.get(video.id)?.url || video.url,
                        expirationDate: group.expirationDate,
                        type: "VIDEO" as const,
                        coverImageUrl: videoMap.get(video.id)?.coverImgUrl || video.coverImgUrl,
                        contents: videoMap.get(video.id)?.contents || video.contents,
                        orderNumber: video.orderNumber || 0,
                      }))
                      .sort((a, b) => {
                        return a.orderNumber - b.orderNumber
                      }),
                  }))
                  .sort((a, b) => a.id - b.id),
                videos: group.content.videos
                  .map((video) => ({
                    id: video.id,
                    name: video.title,
                    url: videoMap.get(video.id)?.url || video.url,
                    expirationDate: group.expirationDate,
                    type: "VIDEO" as const,
                    coverImageUrl: videoMap.get(video.id)?.coverImgUrl || video.coverImgUrl,
                    contents: videoMap.get(video.id)?.contents || video.contents,
                    orderNumber: video.orderNumber || 0,
                  }))
                  .sort((a, b) => {
                    return a.orderNumber - b.orderNumber
                  }), // Sort videos by orderNumber
              })
            }
          })

        const uniquePlaylists = new Map<number, Playlist>()
        data.playlists
          .filter((playlist) => isNotExpired(playlist.expirationDate, currentDate))
          .forEach((playlist) => {
            uniquePlaylists.set(playlist.content.id, {
              id: playlist.content.id,
              name: playlist.content.title,
              expirationDate: playlist.expirationDate,
              type: "PLAYLIST" as const,
              videos: playlist.content.videos
                .map((video) => ({
                  id: video.id,
                  name: video.title,
                  url: videoMap.get(video.id)?.url || video.url,
                  expirationDate: playlist.expirationDate,
                  type: "VIDEO" as const,
                  coverImageUrl: videoMap.get(video.id)?.coverImgUrl || video.coverImgUrl,
                  contents: videoMap.get(video.id)?.contents || video.contents,
                  orderNumber: video.orderNumber || 0,
                }))
                .sort((a, b) => a.orderNumber - b.orderNumber),
            })
          })

        const filteredVideos: Video[] = data.videos
          .filter((video) => isNotExpired(video.expirationDate, currentDate))
          .map((video) => ({
            id: video.content.id,
            name: video.content.title,
            url: video.content.url,
            expirationDate: video.expirationDate,
            type: "VIDEO" as const,
            coverImageUrl: video.content.coverImgUrl,
            contents: video.content.contents,
            orderNumber: video.content.orderNumber || 0,
          }))
          .sort((a, b) => a.orderNumber - b.orderNumber) // Sort standalone videos by orderNumber

        const allItems: Item[] = [...uniqueGroups.values(), ...uniquePlaylists.values(), ...filteredVideos]
        setItemsSafe(allItems)
      } catch (e: any) {
        console.error("API ERROR:", e?.response?.data || e.message || e)
        if (e?.response?.status === 401) {
          await auth.removeToken()
          navigation.replace("Home")
        }
      } finally {
        isFetchingRef.current = false
        if (!isRefresh) setLoadingSafe(false)
        if (isRefresh) setRefreshingSafe(false)
      }
    },
    [navigation, setItemsSafe, setLoadingSafe, setUserSafe, setRefreshingSafe],
  )
  React.useEffect(() => {
    fetchUserThenData()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshingSafe(true)
    await fetchUserThenData(true)
  }, [fetchUserThenData, setRefreshingSafe])

  const keyExtractor = useCallback((item: Item | undefined, index: number) => {
    return item ? `${item.type}-${item.id}` : `skeleton-${index}`
  }, [])

  const renderItem = useCallback(
    ({ item, index }: { item: Item | undefined; index: number }) => {
      if (loading) {
        return (
          <View style={[styles.tableRow, styles.skeletonRow]}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <View style={styles.skeletonCell} />
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <View style={styles.skeletonCell} />
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <View style={styles.skeletonCell} />
            </View>
          </View>
        )
      }
      if (!item) return null

      let handlePress: () => void
      let itemCount = ""
      let iconName: string
      const typeLabel: string = item.type
      const displayName: string = item.name
      const formattedExpirationDate = new Date(item.expirationDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      switch (item.type) {
        case "GROUP":
          handlePress = () => {
            navigation.navigate("GroupDetail", { id: item.id, title: item.name, group: item })
          }
          itemCount = `${item.playlists.length} Playlists, ${item.videos.length} Videos`
          iconName = "folder"
          break
        case "PLAYLIST":
          handlePress = () => {
            navigation.navigate("PlaylistDetail", { id: item.id, title: item.name, playlist: item })
          }
          itemCount = `${item.videos.length} Videos`
          iconName = "list"
          break
        case "VIDEO":
          handlePress = () => {
            console.log("Navigating to VideoScreen with:", { id: item.id, title: item.name, url: item.url })
            navigation.navigate("VideoScreen", {
              id: item.id,
              title: item.name,
              coverImageUrl: item.coverImageUrl,
              url: item.url,
              expirationDate: item.expirationDate,
              contents: item.contents,
            })
          }
          itemCount = ""
          iconName = "play-circle"
          break
        default:
          return null
      }

      return (
        <TouchableOpacity
          style={[styles.tableRow, Platform.OS === "web" && styles.tableRowHover]}
          onPress={handlePress}
        >
          <View style={[styles.tableCell, { flex: 2 }]}>
            <View style={styles.cellContent}>
              {item.type === "VIDEO" && item.coverImageUrl && (
                <View style={[styles.thumbnailContainer, { width: thumbnailSize, height: thumbnailSize }]}>
                  <Image
                    source={{ uri: item.coverImageUrl }}
                    style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
                    resizeMode="cover"
                  />
                  <Ionicons
                    name="play-circle"
                    size={iconSize}
                    color="#ffffff"
                    style={[
                      styles.thumbnailIcon,
                      { transform: [{ translateX: -iconSize / 2 }, { translateY: -iconSize / 2 }] },
                    ]}
                  />
                </View>
              )}
              {(item.type !== "VIDEO" || !item.coverImageUrl) && (
                <Ionicons name={iconName} size={iconSize} color="#1ed488" style={styles.icon} />
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.nameScrollContainer}
                contentContainerStyle={styles.nameScrollContent}
              >
                <Text style={[styles.cellText, { fontSize: fontSizeCell }]}>{displayName}</Text>
              </ScrollView>
            </View>
          </View>
          <View style={[styles.tableCell, { flex: 1 }]}>
            <Text style={[styles.cellText, { fontSize: fontSizeCell }]}>{itemCount}</Text>
          </View>
          <View style={[styles.tableCell, { flex: 1 }]}>
            <Text style={[styles.cellTypeText, { fontSize: fontSizeType }]}>{typeLabel}</Text>
            <Text style={[styles.expirationText, { fontSize: fontSizeType }]}>{formattedExpirationDate}</Text>
          </View>
        </TouchableOpacity>
      )
    },
    [loading, navigation, isMobile, thumbnailSize, iconSize, fontSizeCell, fontSizeType],
  )

  const dataForList = useMemo(
    () => (loading ? Array.from({ length: 4 }).map(() => undefined) : items),
    [loading, items],
  )

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Header title="Home" />
      {!isConnected ?
       <View>
        <OfflineBanner />
        <Image
          source={require("../../assets/images/4093050.jpg")}
          style={{ width: '100%', height: '50%', marginTop: 100 }}
          resizeMode="contain"
        />
        </View>
         : 
         <FlatList
        data={dataForList}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ padding: SPACING }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1ed488"]} tintColor="#1ed488" />
        }
        showsVerticalScrollIndicator={false}
      /> }
      
    </View>
  )
}

const styles = StyleSheet.create({
  cellContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cellText: {
    color: "#475569",
    fontWeight: "500",
  },
  cellTypeText: {
    color: "#1ed488",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  icon: {
    marginRight: 8,
  },
  skeletonCell: {
    flex: 1,
    height: 14,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
    borderRadius: 4,
  },
  skeletonRow: {
    opacity: 0.7,
  },
  tableCell: {
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableRowHover: {
    ...Platform.select({
      web: {
        transitionDuration: "200ms",
        transitionProperty: "transform, shadow",
        ":hover": {
          transform: [{ scale: 1.02 }],
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
      },
    }),
  },
  thumbnail: {
    borderRadius: 4,
  },
  thumbnailContainer: {
    position: "relative",
    marginRight: 8,
  },
  thumbnailIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  nameScrollContainer: {
    flex: 1,
    maxWidth: "80%",
  },
  nameScrollContent: {
    alignItems: "center",
  },
  expirationText: {
    color: "#6b7280",
    fontWeight: "400",
    marginTop: 4,
  },
})
