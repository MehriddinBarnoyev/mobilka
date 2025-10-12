import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  isTablet,
  isLandscape,
  responsiveWidth as wp,
  responsiveHeight as hp,
} from '../../../utils/responsive';
import {fontScale as fs} from '../../../utils/fontScale';

interface Props { total: number; currentIndex: number }

export const PlaylistHeader = ({ total, currentIndex }: Props) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.title}>Up Next</Text>
      <Text style={styles.subtitle}>{total} videos in queue</Text>
    </View>
    <Text style={styles.count}>
      {currentIndex + 1}/{total}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },
  title: { fontSize: fs(24), fontWeight: '800' },
  subtitle: { fontSize: fs(14), color: '#95a5a6' },
  count: {
    fontSize: fs(14),
    backgroundColor: '#f8f9fa',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(6),
  },
});
