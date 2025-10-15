"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, Image, Button, Alert, StatusBar } from "react-native"
import { VdoDownload } from "vdocipher-rn-bridge"
import type { DownloadStatus, OfflineEmbedInfo } from "vdocipher-rn-bridge/type"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../type"
import { useNetwork } from "../../hooks/useNetwork"
import ScreenHeader from "../components/core/ScreenHeader"
import { OfflineBanner } from "../components/core/OfflineBanner"

type Props = NativeStackScreenProps<RootStackParamList, "MyDownloads">

const makeOfflineEmbedInfo = (mediaId: string, enableAutoResume?: boolean): OfflineEmbedInfo => {
  return {
    offline: true,
    mediaId,
    enableAutoResume,
  }
}

export default function MyDownloadsScreen({ navigation }: Props) {
  const { isConnected } = useNetwork()

  const [downloadStatusArray, setDownloadStatusArray] = useState<DownloadStatus[]>([])
  const [listeners, setListeners] = useState<Array<() => void>>([])

  useEffect(() => {
    StatusBar.setBarStyle("dark-content")
    console.log("[MyDownloadsScreen] mounted")
    VdoDownload.query()
      .then((statusList: any) => {
        console.log(
          "[MyDownloadsScreen] All media IDs:",
          statusList.map((item: any) => item.mediaInfo.mediaId),
        )
        setDownloadStatusArray(statusList)
      })
      .catch((err: any) => console.warn("[query error]", err))

    _refreshDownloadList()

    const newListeners = [
      VdoDownload.addEventListener("onQueued", ({ mediaId, status }: any) => _refreshDownloadList()),
      VdoDownload.addEventListener("onChanged", ({ mediaId, status }: any) => _updateItem(mediaId, status)),
      VdoDownload.addEventListener("onCompleted", ({ mediaId, status }: any) => _refreshDownloadList()),
      VdoDownload.addEventListener("onFailed", ({ mediaId, status }: any) => _refreshDownloadList()),
      VdoDownload.addEventListener("onDeleted", (mediaId: any) => _refreshDownloadList()),
    ]

    setListeners(newListeners)

    return () => {
      console.log("[MyDownloadsScreen] unmounted")
      newListeners.forEach((fn) => fn())
    }
  }, [])

  const _refreshDownloadList = () => {
    VdoDownload.query()
      .then(setDownloadStatusArray)
      .catch((err: any) => console.warn("[query error]", err))
  }

  const _updateItem = (mediaId: string, updatedStatus: DownloadStatus) => {
    const index = downloadStatusArray.findIndex((d) => d.mediaInfo.mediaId === mediaId)
    if (index === -1) return _refreshDownloadList()

    const updatedArray = [...downloadStatusArray]
    updatedArray[index] = updatedStatus
    setDownloadStatusArray(updatedArray)
  }

  const _handlePlay = (mediaId: string, enableAutoResume?: boolean) => {
    navigation.navigate("NativeControls", {
      embedInfo: makeOfflineEmbedInfo(mediaId, enableAutoResume ?? true),
    })
  }

  const _handleDelete = (mediaId: string) => {
    Alert.alert("Delete Download", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => VdoDownload.remove([mediaId]).catch((err: any) => console.warn("[delete error]", err)),
      },
    ])
  }

  const renderItem = ({ item }: { item: DownloadStatus }) => {
    const { mediaInfo, status, downloadPercent, poster } = item

    return (
      <View style={styles.item}>
        {poster && <Image source={{ uri: `file://${poster}` }} style={styles.poster} resizeMode="cover" />}
        <Text style={styles.title}>{mediaInfo.title || "Untitled Video"}</Text>
        <Text style={styles.status}>
          {status.toUpperCase()} - {downloadPercent}%
        </Text>
        <View style={styles.buttonGroup}>
          <Button title="Play" disabled={status !== "completed"} onPress={() => _handlePlay(mediaInfo.mediaId, true)} />
          <Button title="Delete" color="red" onPress={() => _handleDelete(mediaInfo.mediaId)} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Downloads" />
      <OfflineBanner />
      <FlatList
        contentContainerStyle={styles.scroll}
        data={downloadStatusArray}
        keyExtractor={(item) => item.mediaInfo.mediaId}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No downloads available.</Text>}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafbfc" },
  scroll: { padding: 20 },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  poster: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 12,
    aspectRatio: 16 / 9,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  status: {
    fontSize: 14,
    color: "gray",
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "gray",
    fontStyle: "italic",
  },
})
