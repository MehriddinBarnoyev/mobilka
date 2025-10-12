import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {Layers} from 'lucide-react-native';
import {VideoItem} from '../../../types/videoType';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../type';
import api from '../../../core/api/apiService';

type VideoCardProps = {
  data: any;
  numColumns: number;
};

export default function VideoCard({data, numColumns}: VideoCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {coverImgUrl, duration, title, description, isGroup} = data;
  const isPlaylist = isGroup === true;

  const navigate = async () => {
    console.log("-==-=-=-=-: ", data.id);
    if (isPlaylist) {
      navigation.navigate('Playlist', {groupId: data.id, title: data.title});
    } else {
      try {
        const response = await api.post(
          `services/videoedums/api/otp?videoId=${data.id}`,
        );

        
        
        const {otp, playbackInfo} = response.data;

        navigation.navigate('VideoScreen', {
          ...data,
          otp,
          playbackInfo,
        });
      } catch (error) {
        console.error('Failed to load video OTP:', error);
      }
    }
  };

  const formatDuration = (sec?: number | null) => {
    if (!sec || typeof sec !== 'number') return '00:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? [h, m, s].map(unit => String(unit).padStart(2, '0')).join(':')
      : [m, s].map(unit => String(unit).padStart(2, '0')).join(':');
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={navigate}>
      <View style={styles.thumbnailWrapper}>
        {isPlaylist ? (
          <>
            {/* Bottom Layer - Smallest & Darkest */}
            <View
              style={[
                styles.layerContainer,
                {
                  width: '88%',
                  zIndex: 1,
                  transform: [{translateY: numColumns === 1 ? -40 : -20}],
                  backgroundColor: '#16a34a', // Tailwind green-500
                },
              ]}>
              <Text style={styles.layerTextOnly}>{title}</Text>
            </View>

            {/* Middle Layer - Medium Size */}
            <View
              style={[
                styles.layerContainer,
                {
                  width: '94%',
                  zIndex: 2,
                  transform: [{translateY: numColumns === 1 ? -20 : -10}],
                  backgroundColor: '#15803d', // Tailwind green-600
                },
              ]}>
              <Text style={styles.layerTextOnly}>{title}</Text>
            </View>

            {/* Top Layer - Full Size & Bright */}
            <View
              style={[
                styles.thumbnail,
                {zIndex: 3, backgroundColor: '#15803d'}, // Tailwind green-700
                styles.image,
                {justifyContent: 'center', alignItems: 'center'},
              ]}>
              <Text style={styles.layerTextOnly}>{title}</Text>
              <View style={styles.layers}>
                <Layers size={20} color="#fff" />
                <Text style={styles.layerText}>Playlist</Text>
              </View>
            </View>
          </>
        ) : (
          <ImageBackground
            source={{uri: coverImgUrl}}
            style={styles.thumbnail}
            imageStyle={styles.image}>
            <View style={styles.duration}>
              <Text style={styles.durationText}>
                {formatDuration(duration)}
              </Text>
            </View>
          </ImageBackground>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  layerTextOnly: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 12,
    textAlignVertical: 'center',
  },

  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'visible',
    marginBottom: 24,
  },
  thumbnailWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    position: 'absolute',
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 16,
    backgroundColor: '#3FBE89',
  },
  layerContainer: {
    position: 'absolute',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  layerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  layers: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(30,41,59,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layerText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  duration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
});
