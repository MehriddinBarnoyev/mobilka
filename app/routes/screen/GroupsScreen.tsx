// Compare this snippet from app/components/core/header.tsx:

import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {VideoList} from '../../../types/videoType';
import {RootStackParamList} from '../../../type';
import api from '../../../core/api/apiService';
import auth from '../../../utils/auth';

import VideoCardSkeleton from '../../components/core/VideoCardSkeleton';
import VideoCard from '../../components/ui/VideoCard';
import ScreenHeader from '../../components/core/ScreenHeader';

export default function HomeGroup(
  props: NativeStackScreenProps<RootStackParamList, 'HomeGroup'>,
) {
  const {width} = useWindowDimensions();

  const {id, title} = props.route.params;

  const CARD_MIN_WIDTH = 280; // kartochka uchun optimal minimal o'lcham
  const SPACING = 12; // kartalar orasidagi bo‘shliq
  const numColumns = Math.max(
    1,
    Math.floor(width / (CARD_MIN_WIDTH + SPACING)),
  );

  const [videoData, setVideoData] = useState<VideoList>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/videoedums/api/videos/mobile', {
        params: {groupId: id},
      });

      
      
      console.log(res.data);

      setVideoData(res.data);
    } catch (e: any) {
      console.error('API ERROR:', e?.response?.data || e.message || e);
      if (e?.response?.status === 401) {
        // Handle unauthorized access, e.g., redirect to login
        auth.removeToken();
        navigation.replace('Home');
        console.warn('Unauthorized access, redirecting to login...');
      }
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
            <View style={{flex: 1 / numColumns, padding: SPACING / 2,}}>
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
