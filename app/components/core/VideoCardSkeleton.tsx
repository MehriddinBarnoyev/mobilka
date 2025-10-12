import React from 'react';
import {View, StyleSheet} from 'react-native';

type Props = {
  numColumns: number;
};

export default function VideoCardSkeleton({numColumns}: Props) {
  return (
    <View style={{flex: 1 / numColumns, padding: 6}}>
      <View style={styles.card}>
        <View style={styles.thumbnail} />
        <View style={styles.textLine} />
        <View style={[styles.textLine, {width: '60%'}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
  },
  textLine: {
    height: 14,
    backgroundColor: '#e2e8f0',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 8,
  },
});
