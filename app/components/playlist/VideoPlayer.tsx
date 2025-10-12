import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {VdoPlayerView} from 'vdocipher-rn-bridge';
import {
  isTablet,
  isLandscape,
  responsiveWidth as wp,
  responsiveHeight as hp,
} from '../../../utils/responsive';

interface Props {
  embedInfo: any;
  onMediaEnded: () => void;
}

export const VideoPlayer = ({embedInfo, onMediaEnded}: Props) => {
  const {width, height} = useWindowDimensions();
  const landscape = isLandscape();
  const tablet = isTablet();

  const playerWidth = landscape && tablet ? width * 0.6 : width - wp(8);
  const playerHeight = (playerWidth * 9) / 16;

  return (
    <View style={[styles.wrapper, {width: playerWidth, height: playerHeight}]}>
      <VdoPlayerView
        style={styles.player}
        embedInfo={embedInfo}
        onMediaEnded={onMediaEnded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: hp(2),
  },
  player: {flex: 1},
});
