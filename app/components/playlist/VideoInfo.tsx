import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  isTablet,
  isLandscape,
  responsiveWidth as wp,
  responsiveHeight as hp,
} from '../../../utils/responsive';
import {fontScale as fs} from '../../../utils/fontScale';

interface Props {
  title: string;
  duration: string;
}

export const VideoInfo = ({title, duration}: Props) => (
  <View style={styles.card}>
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.duration}>{duration}</Text>
    </View>
    <View style={styles.dot} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: wp(4),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  content: {flex: 1},
  title: {fontSize: fs(18), fontWeight: '700', marginBottom: hp(0.5)},
  duration: {fontSize: fs(14), color: '#7f8c8d'},
  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: '#e74c3c',
  },
});
