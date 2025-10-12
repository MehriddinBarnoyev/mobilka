"use client"

import React, { useCallback, useMemo, useEffect } from 'react';
import { FlatList, Text, useWindowDimensions, View, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/core/header';
import { RootStackParamList } from '../../type';
import { useSecurity } from '../../hooks/useSecurity';

type Video = {
    id: number;
    name: string;
    url: string | null;
    expirationDate: string;
    type: "VIDEO";
    coverImageUrl: string | null;
    contents: { id: number; type: "TEXT" | "IMAGE"; textContent: string | null; resourceKey: string | null; orderNumber: number | null }[];
};

type Playlist = {
    id: number;
    name: string;
    expirationDate: string;
    type: "PLAYLIST";
    videos: Video[];
};

type Item = Playlist | Video;

export function GroupDetail() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<NativeStackScreenProps<RootStackParamList, 'GroupDetail'>['route']>();
    const { top } = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { title, group } = route.params;
    const { isSecured } = useSecurity();

    const SPACING = width > 768 ? 16 : 12;
    const items: Item[] = [
        ...group.playlists.map((playlist: { videos: any; }) => ({
            ...playlist,
            videos: [...playlist.videos].sort((a, b) => {
                const orderA = a.orderNumber ?? 0;
                const orderB = b.orderNumber ?? 0;
                return orderA - orderB;
            }),
        })),
        ...[...group.videos].sort((a, b) => {
            const orderA = a.orderNumber ?? 0;
            const orderB = b.orderNumber ?? 0;
            return orderA - orderB;
        }),
    ];

    const keyExtractor = useCallback((item: Item, index: number) => {
        return `${item.type}-${item.id}`;
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: Item }) => {
            let handlePress: () => void;
            let itemCount = "";
            let iconName: string;
            const typeLabel: string = item.type;
            let displayName: string = item.name;

            switch (item.type) {
                case "PLAYLIST":
                    handlePress = () => {
                        navigation.navigate("PlaylistDetail", { id: item.id, title: item.name, playlist: item });
                    };
                    itemCount = `${item.videos.length} Videos`;
                    iconName = "list";
                    break;
                case "VIDEO":
                    handlePress = () => {
                        navigation.navigate("VideoScreen", {
                            id: item.id,
                            title: item.name,
                            coverImageUrl: item.coverImageUrl,
                            url: item.url,
                            expirationDate: group.expirationDate,
                            contents: item.contents
                        });
                    };
                    itemCount = "";
                    iconName = "play-circle";
                    displayName = item.name.length > 25 ? item.name.slice(0, 23) + ' ...' : item.name;
                    break;
                default:
                    return null;
            }

            return (
                <TouchableOpacity style={[styles.tableRow, Platform.OS === "web" && styles.tableRowHover]} onPress={handlePress}>
                    <View style={[styles.tableCell, { flex: width > 768 ? 2 : 1.5 }]}>
                        <View style={styles.cellContent}>
                            {item.type === "VIDEO" && item.coverImageUrl && (
                                <View style={styles.thumbnailContainer}>
                                    <Image
                                        source={{ uri: item.coverImageUrl }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                    <Ionicons
                                        name="play-circle"
                                        size={24}
                                        color="#ffffff"
                                        style={styles.thumbnailIcon}
                                    />
                                </View>
                            )}
                            {(item.type !== "VIDEO" || !item.coverImageUrl) && (
                                <Ionicons name={iconName} size={24} color="#1ed488" style={styles.icon} />
                            )}
                            <Text style={styles.cellText} numberOfLines={1}>
                                {displayName}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.cellText}>{itemCount}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.cellTypeText}>{typeLabel}</Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [navigation, width, group.expirationDate]
    );

    const renderHeader = useCallback(() => <></>, [width]);

    const renderEmpty = useCallback(() => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No playlists or videos available in this group.</Text>
        </View>
    ), []);

    return (
        <View style={[styles.container, { paddingTop: top }]}>
            <Header title={title} />
            <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={{ padding: SPACING }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
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
    tableCell: {
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cellContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    thumbnailContainer: {
        position: "relative",
        width: 40,
        height: 40,
        marginRight: 8,
    },
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    thumbnailIcon: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -12 }, { translateY: -12 }],
    },
    icon: {
        marginRight: 8,
    },
    cellText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "500",
    },
    cellTypeText: {
        fontSize: 14,
        color: "#1ed488",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
    },
});