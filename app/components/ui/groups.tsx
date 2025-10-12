import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {GroupIcon, Layers, Users} from 'lucide-react-native';
import {VideoItem} from '../../../types/videoType';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../type';
import api from '../../../core/api/apiService';
import {Group} from '../../../types/groups';

type VideoCardProps = {
  data: any;
  numColumns: number;
};

export default function GroupCard({data}: VideoCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('HomeGroup', {id: data.id, title: data.label});
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={handlePress}>
      <View style={styles.thumbnailWrapper}>
        {/* Top Layer - Full Size & Bright */}
        <View
          style={[
            styles.thumbnail,
            {zIndex: 3, backgroundColor: '#15803d'}, // Tailwind green-700
            styles.image,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <Text style={styles.layerTextOnly}>{data.name}</Text>
          <View style={styles.layers}>
            <Users size={20} color="#fff" />
            <Text style={styles.layerText}>Guruh</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {data.label}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {data.description || 'No description available'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  layerTextOnly: {
    color: '#fff',
    fontSize: 28,
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
