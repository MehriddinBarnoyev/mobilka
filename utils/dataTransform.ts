import type { Video, Playlist, Group, Item, ApiResponse } from "../types/shared"
import { isNotExpired } from "./date"

export const buildVideoMap = (
  videos: ApiResponse["videos"],
): Map<number, { url: string | null; coverImgUrl: string | null; contents: any[] }> => {
  const videoMap = new Map()
  videos.forEach((video) => {
    videoMap.set(video.content.id, {
      url: video.content.url,
      coverImgUrl: video.content.coverImgUrl,
      contents: video.content.contents.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)),
    })
  })
  return videoMap
}

export const transformVideoData = (rawVideo: any, videoMap: Map<number, any>, expirationDate: string): Video => ({
  id: rawVideo.id,
  name: rawVideo.title,
  url: videoMap.get(rawVideo.id)?.url || rawVideo.url,
  expirationDate,
  type: "VIDEO" as const,
  coverImageUrl: videoMap.get(rawVideo.id)?.coverImgUrl || rawVideo.coverImgUrl,
  contents: videoMap.get(rawVideo.id)?.contents || rawVideo.contents,
  orderNumber: rawVideo.orderNumber || 0,
})

export const transformPlaylistData = (
  rawPlaylist: any,
  videoMap: Map<number, any>,
  expirationDate: string,
): Playlist => ({
  id: rawPlaylist.id,
  name: rawPlaylist.title,
  expirationDate,
  type: "PLAYLIST" as const,
  videos: rawPlaylist.videos
    .map((video: any) => transformVideoData(video, videoMap, expirationDate))
    .sort((a, b) => a.orderNumber - b.orderNumber),
})

export const transformGroupData = (rawGroup: any, videoMap: Map<number, any>): Group => ({
  id: rawGroup.content.id,
  name: rawGroup.content.name,
  expirationDate: rawGroup.expirationDate,
  type: "GROUP" as const,
  playlists: rawGroup.content.playlists
    .map((playlist: any) => transformPlaylistData(playlist, videoMap, rawGroup.expirationDate))
    .sort((a, b) => a.id - b.id),
  videos: rawGroup.content.videos
    .map((video: any) => transformVideoData(video, videoMap, rawGroup.expirationDate))
    .sort((a, b) => a.orderNumber - b.orderNumber),
})

export const processApiResponse = (data: ApiResponse): Item[] => {
  const currentDate = new Date()
  const videoMap = buildVideoMap(data.videos)

  const uniqueGroups = new Map<number, Group>()
  data.groups
    .filter((group) => isNotExpired(group.expirationDate, currentDate))
    .forEach((group) => {
      const existing = uniqueGroups.get(group.content.id)
      const newGroup = transformGroupData(group, videoMap)

      if (!existing || new Date(newGroup.expirationDate) > new Date(existing.expirationDate)) {
        uniqueGroups.set(group.content.id, newGroup)
      }
    })

  const uniquePlaylists = new Map<number, Playlist>()
  data.playlists
    .filter((playlist) => isNotExpired(playlist.expirationDate, currentDate))
    .forEach((playlist) => {
      const transformed = transformPlaylistData(playlist.content, videoMap, playlist.expirationDate)
      uniquePlaylists.set(playlist.content.id, transformed)
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
    .sort((a, b) => a.orderNumber - b.orderNumber)

  return [...uniqueGroups.values(), ...uniquePlaylists.values(), ...filteredVideos]
}

export const buildVideoExpirationMap = (data: ApiResponse): Map<number, string> => {
  const currentDate = new Date()
  const expMap = new Map<number, string>()

  data.groups
    .filter((group) => isNotExpired(group.expirationDate, currentDate))
    .forEach((group) => {
      group.content.playlists.forEach((playlist) => {
        playlist.videos.forEach((video) => {
          updateExpirationMap(expMap, video.id, group.expirationDate)
        })
      })
      group.content.videos.forEach((video) => {
        updateExpirationMap(expMap, video.id, group.expirationDate)
      })
    })

  data.playlists
    .filter((playlist) => isNotExpired(playlist.expirationDate, currentDate))
    .forEach((playlist) => {
      playlist.content.videos.forEach((video) => {
        updateExpirationMap(expMap, video.id, playlist.expirationDate)
      })
    })

  data.videos
    .filter((video) => isNotExpired(video.expirationDate, currentDate))
    .forEach((video) => {
      updateExpirationMap(expMap, video.content.id, video.expirationDate)
    })

  return expMap
}

const updateExpirationMap = (map: Map<number, string>, videoId: number, expirationDate: string) => {
  const existing = map.get(videoId)
  if (!existing || new Date(expirationDate) > new Date(existing)) {
    map.set(videoId, expirationDate)
  }
}
