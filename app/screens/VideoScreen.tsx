"use client"

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Text,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../type';
import { VideoPlayer } from '../components/video/videoPlayer';
import ScreenHeader from '../components/core/ScreenHeader';
import { isTablet } from '../../utils/responsive';
import { Attachments } from '../components/video/attachments';
import api from "../../core/api/apiService";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import VideoInfo from '../components/video/videoInfo';
import {VideoItem} from '../../types/videoType';




type ContentItem = {
  id: number;
  type: "TEXT" | "IMAGE";
  textContent: string | null;
  // resourceKey: string | null;
  orderNumber: number | null;
  downloadUrl: string | null;
}

export default function VideoScreen() {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const route = useRoute<NativeStackScreenProps<RootStackParamList, 'VideoScreen'>['route']>();
  const { top } = useSafeAreaInsets();
  const { id, title, coverImageUrl, expirationDate, contents: contents }: Readonly<VideoItem & {
    otp: string;
    playbackInfo: string;
    coverImageUrl: string | null;
    expirationDate: string
  }> = route.params;

  const [otp, setOtp] = React.useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = React.useState<any>(null);
  const [loadingOtp, setLoadingOtp] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      console.log("VideoScreen Params:", { id, title, coverImageUrl, expirationDate }); // Debug log
      const fetchOtp = async () => {
        if (!id || !expirationDate) {
          console.log("Missing required params:", { id, expirationDate }); // Debug log
          setError("Missing required parameters.");
          setLoadingOtp(false);
          return;
        }

        try {
          setLoadingOtp(true);
          setError(null);
          const requestBody = {
            videoId: id,
            endDate: expirationDate
          };
          console.log("OTP Request Body:", requestBody);

          const response = await api.post("/services/videoedums/api/otp/v2", requestBody);
          const data = response.data;
          console.log("OTP Response:", data);
          setOtp(data.otp || data.otpToken);
          setPlaybackInfo(data.playbackInfo || data);
        } catch (error: any) {
          console.error("OTP Fetch Error:", error?.response?.data || error.message || error);
          setError("Failed to load video. Please try again.");
        } finally {
          setLoadingOtp(false);
        }
      };

      fetchOtp();
    }, [id, title, coverImageUrl, expirationDate])
  );

  if (loadingOtp) {
    return (
      <View style={[styles.container, { paddingTop: top }]}>
        <ScreenHeader title={title} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafbfc" />
      <ScreenHeader title={title} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          landscape && isTablet()
            ? styles.landscapeScroll
            : styles.portraitScroll,
        ]}>
        <View
          style={[
            styles.playerContainer,
            landscape && isTablet() && styles.playerLandscape,
          ]}>
          {otp && playbackInfo ? (
            <VideoPlayer
              embedInfo={{otp, playbackInfo, title, id}}
              width={landscape && isTablet() ? width * 0.6 : width - 40}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error || 'Video not available.'}
              </Text>
              {coverImageUrl && (
                <Image
                  source={{uri: coverImageUrl}}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        </View>

        <View
          style={[
            styles.infoContainer,
            landscape && isTablet() && styles.infoLandscape,
          ]}>
          <VideoInfo
            title={title}
            description={''}
            otp={otp || ''}
            playbackInfo={playbackInfo}
          />

          {contents && contents.length > 0 && (
            <View style={styles.contentsSection}>
              <Text style={styles.sectionTitle}>Additional Contents</Text>
              {contents
                .sort(
                  (a: ContentItem, b: ContentItem) =>
                    (a.orderNumber || 0) - (b.orderNumber || 0),
                )
                .map((item: ContentItem, index: number) => (
                  <View
                    key={`content-${item.id}-${index}`}
                    style={styles.contentItem}>
                    {item.type === 'TEXT' && item.textContent && (
                      <Text style={styles.contentText}>
                        {item.textContent.trim()}
                      </Text>
                    )}
                    {item.type === 'IMAGE' && item.downloadUrl && (
                      <Image
                        source={{uri: item.downloadUrl}}
                        style={styles.contentImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                ))}
            </View>
          )}

          <Attachments
            id={id}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  scroll: {
    padding: 20,
  },
  portraitScroll: {
    flexDirection: 'column',
  },
  landscapeScroll: {
    flexDirection: 'row',
    gap: 20,
  },
  playerContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playerLandscape: {
    flex: 0.6,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLandscape: {
    flex: 0.4,
    marginTop: 0,
    justifyContent: 'center',
  },
  contentsSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  contentItem: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#475569',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e11d48',
    marginBottom: 10,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});
