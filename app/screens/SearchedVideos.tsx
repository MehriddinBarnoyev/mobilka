// screens/SearchedVideos.tsx
import React, {useCallback, useState} from 'react';
import {
    FlatList,
    RefreshControl,
    View,
    useWindowDimensions,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../type';
import {VideoItemWithPlayback} from '../../types/videoType';
import ScreenHeader from '../components/core/ScreenHeader';
import VideoCardSkeleton from '../components/core/VideoCardSkeleton';
import VideoCard from '../components/ui/VideoCard';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchedVideos'>;

export default function SearchedVideos({route}: Props) {
    const {title, videos} = route.params;

    const {width} = useWindowDimensions();
    const [refreshing, setRefreshing] = useState(false);
    const [loading] = useState(false);
    const CARD_MIN_WIDTH = 280;
    const SPACING = 12;

    const numColumns = Math.max(
        1,
        Math.floor(width / (CARD_MIN_WIDTH + SPACING)),
    );

    const onRefresh = useCallback(() => {
        setRefreshing(false);
    }, []);

    return (
        <View style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <ScreenHeader title={title} />

            <FlatList
                key={numColumns}
                data={loading ? Array.from({length: numColumns * 2}) : videos}
                numColumns={numColumns}
                renderItem={({item, index}) =>
                    loading ? (
                        <VideoCardSkeleton key={index} numColumns={numColumns} />
                    ) : (
                        <View style={{flex: 1 / numColumns, padding: SPACING / 2}}>
                            <VideoCard
                                numColumns={numColumns}
                                data={item as VideoItemWithPlayback}
                            />
                        </View>
                    )
                }
                {...(numColumns > 1 && {
                    columnWrapperStyle: {paddingHorizontal: SPACING / 2},
                })}
                contentContainerStyle={{padding: SPACING}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
