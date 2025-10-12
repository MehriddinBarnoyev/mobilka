import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {
  isTablet,
  isLandscape,
  responsiveWidth as wp,
  responsiveHeight as hp,
} from '../../../utils/responsive';
import {fontScale as fs} from '../../../utils/fontScale';

interface Props {
  item: any;
  isPlaying: boolean;
  onSelect: () => void;
}

export const VideoItem = ({item, isPlaying, onSelect}: Props) => (
  <TouchableOpacity onPress={onSelect} style={styles.wrapper}>
    <Image source={{uri: item.poster}} style={styles.poster} />
    <View style={styles.info}>
      <Text
        style={[styles.title, isPlaying && {color: '#3498db'}]}
        numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.duration}>{item.duration}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    marginBottom: hp(2),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp(3),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  poster: {
    width: wp(25),
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginRight: wp(3),
  },
  info: {flex: 1, justifyContent: 'center'},
  title: {fontSize: fs(16), fontWeight: '700', marginBottom: hp(0.5)},
  duration: {fontSize: fs(12), color: '#95a5a6'},
});
