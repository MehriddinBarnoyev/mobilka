'use client';

import React, {useMemo} from 'react';
import {FlatList, RefreshControl, View, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../../../type';
import {useNetwork} from '../../../hooks/NetworkProvider';
import {useResponsive} from '../../../hooks/useResponsive';
import {useMediaData} from '../../../hooks/useMediaData';
import {COLORS, SPACING} from '../../constants/theme';
import {Item} from '../../../types/shared';
import {SkeletonRow} from '../../components/core/SkeletonRow';
import {MediaItemRow} from '../../components/core/MediaItemRow';
import Header from '../../components/core/header';
import {OfflineBanner} from '../../components/core/OfflineBanner';
import OfflineImage from '../../../assets/images/offline.jpg';

export default function Home() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {top} = useSafeAreaInsets();
  const {isConnected} = useNetwork();
  const {isMobile, scaleFont} = useResponsive();
  const {items, loading, refreshing, fetchUserThenData, onRefresh, mountedRef} =
    useMediaData();

  const thumbnailSize = isMobile ? 36 : 40;
  const iconSize = isMobile ? 20 : 24;
  const fontSizeCell = scaleFont(isMobile ? 13 : 14);
  const fontSizeType = scaleFont(isMobile ? 12 : 14);
  const paddingHorizontal = isMobile ? SPACING.md : SPACING.lg;

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [mountedRef]);

  React.useEffect(() => {
    fetchUserThenData();
  }, []);

  const keyExtractor = React.useCallback(
    (item: Item | undefined, index: number) => {
      return item ? `${item.type}-${item.id}` : `skeleton-${index}`;
    },
    [],
  );

  const renderItem = React.useCallback(
    ({item, index}: {item: Item | undefined; index: number}) => {
      if (loading) {
        return <SkeletonRow paddingHorizontal={paddingHorizontal} />;
      }
      if (!item) return null;

      const handlePress = () => {
        switch (item.type) {
          case 'GROUP':
            navigation.navigate('GroupDetail', {
              id: item.id,
              title: item.name,
              group: item,
            });
            break;
          case 'PLAYLIST':
            navigation.navigate('PlaylistDetail', {
              id: item.id,
              title: item.name,
              playlist: item,
            });
            break;
          case 'VIDEO':
            navigation.navigate('VideoScreen', {
              id: item.id,
              title: item.name,
              coverImageUrl: item.coverImageUrl,
              url: item.url,
              expirationDate: item.expirationDate,
              contents: item.contents,
            });
            break;
        }
      };

      return (
        <MediaItemRow
          item={item}
          onPress={handlePress}
          thumbnailSize={thumbnailSize}
          iconSize={iconSize}
          fontSizeCell={fontSizeCell}
          fontSizeType={fontSizeType}
        />
      );
    },
    [
      loading,
      navigation,
      thumbnailSize,
      iconSize,
      fontSizeCell,
      fontSizeType,
      paddingHorizontal,
    ],
  );

  const dataForList = useMemo(
    () => (loading ? Array.from({length: 4}).map(() => undefined) : items),
    [loading, items],
  );

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <Header title="Page" />
      {!isConnected ? (
        <View>
          <OfflineBanner />
          <Image
            source={OfflineImage}
            style={{width: '100%', height: '50%', marginTop: 100}}
            resizeMode="contain"
          />
        </View>
      ) : (
        <FlatList
          data={dataForList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{padding: SPACING.md}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
