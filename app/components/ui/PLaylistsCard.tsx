import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface Playlist {
    name: string;
    videos: any[];
}

interface PLaylistProps{
    data: Playlist;
    numColumns: number;
    onPress: () => void;
}

const PlaylistCard: React.FC<PLaylistProps> = ({ data, numColumns, onPress }) => {
    // Calculate card width based on number of columns for responsive layout
    const cardWidth = numColumns > 1 ? '100%' : 280; // Match CARD_MIN_WIDTH from Page.tsx

    return (
        <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {data.name}
                </Text>
                <Text style={styles.subtitle}>
                    {data.videos.length} {data.videos.length === 1 ? 'Video' : 'Videos'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        margin: 6, // Half of SPACING (12 / 2) to match Page.tsx spacing
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
});

export default PlaylistCard;
