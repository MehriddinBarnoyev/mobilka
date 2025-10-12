import {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {RootStackParamList} from '../../type';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {VideoList} from '../../types/videoType';
import api from '../../core/api/apiService';

import VideoCard from '../components/ui/VideoCard';
import ScreenHeader from '../components/core/ScreenHeader';
import VideoCardSkeleton from '../components/core/VideoCardSkeleton';

export default function PlaylistScreen(
  props: NativeStackScreenProps<RootStackParamList, 'Playlist'>,
) {
  const {width} = useWindowDimensions();

  const CARD_MIN_WIDTH = 280; // kartochka uchun optimal minimal o'lcham
  const SPACING = 12; // kartalar orasidagi bo‘shliq
  const numColumns = Math.max(
    1,
    Math.floor(width / (CARD_MIN_WIDTH + SPACING)),
  );

  const [videoData, setVideoData] = useState<VideoList>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/services/videoedums/api/videos?ownerId.equals=${groupId}`,
      );
      setVideoData(res.data);
    } catch (e: any) {
      console.error('API ERROR:', e?.response?.data || e.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  }, []);
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);
  const {title, groupId} = props.route.params;

  return (
    <View style={{flex: 1, backgroundColor: '#f8fafc'}}>
      <ScreenHeader title={title} />
      <FlatList
        key={numColumns}
        data={loading ? Array.from({length: numColumns * 2}) : videoData}
        numColumns={numColumns}
        renderItem={({item, index}) =>
          loading ? (
            <VideoCardSkeleton numColumns={numColumns} key={index} />
          ) : (
            <View style={{flex: 1 / numColumns, padding: SPACING / 2}}>
              <VideoCard numColumns={numColumns} data={item} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
