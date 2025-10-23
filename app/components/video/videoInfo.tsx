'use client';

import {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PixelRatio} from 'react-native';
import {VdoDownload} from 'vdocipher-rn-bridge';
import type {DownloadStatus, Track} from 'vdocipher-rn-bridge/type';
import {isTablet} from '../../../utils/responsive';

interface VideoInfoProps {
  title: string;
  description: string;
  otp: string;
  playbackInfo: string;
}

function VideoInfo({title, description, otp, playbackInfo}: VideoInfoProps) {
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [status, setStatus] = useState<DownloadStatus | null>(null);

  const {width} = useWindowDimensions();
  const {top, bottom} = useSafeAreaInsets();
  const isMobile = width < 600;
  const isTabletDevice = isTablet();
  const isDesktop = width >= 1024;

  // 🔹 FONT SCALE
  const scaleFont = (size: number) => {
    const multiplier =
      width >= 1920
        ? 1.3
        : width >= 1440
        ? 1.2
        : width >= 1024
        ? 1.1
        : width >= 768
        ? 1.0
        : width >= 600
        ? 0.95
        : 0.9;

    return Math.round(PixelRatio.roundToNearestPixel(size * multiplier));
  };

  // 🔹 MEDIA ID HELPER
  const getMediaId = useCallback(() => mediaId, [mediaId]);

  // 🔹 INITIAL DOWNLOAD STATUS CHECK
  const initialCheck = useCallback(async () => {
    try {
      const {downloadOptions} = await VdoDownload.getDownloadOptions({
        otp,
        playbackInfo,
      });
      const id = downloadOptions.mediaInfo.mediaId;
      setMediaId(id);

      const allStatus = await VdoDownload.query();
      const current = allStatus.find(s => s.mediaInfo.mediaId === id);
      if (current) setStatus(current);
    } catch (err) {
      console.warn('[initialCheck] Failed to retrieve download info:', err);
    }
  }, [otp, playbackInfo]);

  // 🔹 SYNC STATUS
  const syncStatus = useCallback(async () => {
    const id = getMediaId();
    if (!id) return;

    try {
      const allStatus = await VdoDownload.query();
      const current = allStatus.find(s => s.mediaInfo.mediaId === id);
      setStatus(current || null);
    } catch (err) {
      console.warn('[VideoInfo] Sync error:', err);
    }
  }, [getMediaId]);

  // 🔹 EVENT LISTENERS
  useEffect(() => {
    let mounted = true;
    initialCheck();

    const interval = setInterval(syncStatus, 3000);

    const addListener = (
      event: string,
      handler: (status?: DownloadStatus) => void,
    ) =>
      VdoDownload.addEventListener(event, (id: string, s: DownloadStatus) => {
        if (id === getMediaId() && mounted) handler(s);
      });

    const unsubscribes = [
      addListener('onChanged', s => setStatus({...s!})),
      addListener('onCompleted', s => setStatus({...s!})),
      addListener('onQueued', s => setStatus({...s!})),
      addListener('onFailed', s => setStatus({...s!})),
      VdoDownload.addEventListener('onDeleted', (id: string) => {
        if (id === getMediaId() && mounted) setStatus(null);
      }),
    ];

    return () => {
      mounted = false;
      clearInterval(interval);
      unsubscribes.forEach(unsub => unsub());
    };
  }, [initialCheck, syncStatus]);

  // 🔹 GET SELECTED TRACKS
  const getSelections = (tracks: Track[]) => {
    const video = tracks.findIndex(t => t.type === 'video');
    const audio = tracks.findIndex(t => t.type === 'audio');
    return [video, audio].filter(i => i !== -1);
  };

  // 🔹 HANDLE DOWNLOAD
  const handleDownload = async () => {
    try {
      const {downloadOptions, enqueue} = await VdoDownload.getDownloadOptions({
        otp,
        playbackInfo,
      });
      const selections = getSelections(downloadOptions.availableTracks);
      const id = downloadOptions.mediaInfo.mediaId;

      setMediaId(id);
      setStatus({
        mediaInfo: downloadOptions.mediaInfo,
        status: 'queued',
        downloadPercent: 0,
        enableAutoResume: true,
        reason: '',
        reasonDescription: '',
        poster: '',
      });

      await enqueue({selections});
      syncStatus();
    } catch (err) {
      console.warn('[VideoInfo] Download start failed:', err);
    }
  };

  // 🔹 HANDLE CANCEL
  const handleCancel = () => {
    const id = getMediaId();
    if (!id) return;

    Alert.alert(
      'Yuklab olishni bekor qilish',
      'Bekor qilishni istayotganingizga ishonchingiz komilmi?',
      [
        {text: "Yo'q", style: 'cancel'},
        {
          text: 'Ha',
          style: 'destructive',
          onPress: async () => {
            try {
              await VdoDownload.remove([id]);
              console.log('[VideoInfo] Download removed');
            } catch (err) {
              console.warn('[VideoInfo] Remove failed:', err);
            }
          },
        },
      ],
    );
  };

  // 🔹 STATUS RENDERING
  const renderStatus = () => {
    if (!status)
      return (
        <Text
          style={[
            styles.statusText,
            {fontSize: scaleFont(isMobile ? 12 : 14)},
          ]}>
          📂 Yuklab olishni boshlash uchun bosing
        </Text>
      );

    const {downloadPercent = 0, status: st, reason, reasonDescription} = status;
    const percent = downloadPercent.toFixed(1);

    const statusText =
      st === 'completed'
        ? '✅ Muvaffaqiyatli yuklab olindi'
        : st === 'downloading'
        ? `⬇️ Yuklab olinmoqda: ${percent}%`
        : st === 'queued' || st === 'pending'
        ? "⏳ Navbatga qo'yildi..."
        : st === 'failed'
        ? `❌ Muvaffaqiyatsiz tugadi: ${reasonDescription || reason}`
        : `⚠️ Status: ${st}`;

    return (
      <View>
        <Text
          style={[
            styles.statusText,
            {fontSize: scaleFont(isMobile ? 12 : 14)},
          ]}>
          {statusText}
        </Text>
        {st === 'downloading' && (
          <View
            style={[
              styles.progressBarContainer,
              {
                height: isMobile ? 6 : 8,
                maxWidth: isDesktop ? 600 : '100%',
              },
            ]}>
            <View
              style={[styles.progressBarFill, {width: `${downloadPercent}%`}]}
            />
          </View>
        )}
      </View>
    );
  };

  // 🔹 BUTTON CONDITIONS
  const isDownloadable =
    !status || ['failed', 'removed'].includes(status.status);
  const buttonWidth = isDesktop ? '60%' : isTabletDevice ? '70%' : '100%';

  return (
    <View
      style={[
        styles.card,
        {
          padding: isMobile ? 12 : isTabletDevice ? 16 : 20,
          marginTop: top,
          marginBottom: bottom,
          maxWidth: isDesktop ? 1200 : '100%',
          alignSelf: 'center',
          width: '100%',
        },
      ]}>
      <View style={styles.content}>
        <Text
          style={[styles.title, {fontSize: scaleFont(isMobile ? 16 : 18)}]}
          numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.meta, {fontSize: scaleFont(isMobile ? 12 : 14)}]}>
          {description}
        </Text>

        <View style={{marginTop: isMobile ? 8 : 10}}>{renderStatus()}</View>

        {isDownloadable &&
          (Platform.OS === 'ios' ? (
            <View
              style={[
                styles.downloadBtn,
                {
                  backgroundColor: '#95a5a6',
                  paddingVertical: isMobile ? 8 : 10,
                  width: buttonWidth,
                  alignSelf: 'center',
                },
              ]}>
              <Text
                style={[
                  styles.downloadBtnText,
                  {fontSize: scaleFont(isMobile ? 14 : 16)},
                ]}>
                🚧 Coming Soon (iOS)
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleDownload}
              style={[
                styles.downloadBtn,
                {
                  paddingVertical: isMobile ? 8 : 10,
                  width: buttonWidth,
                  alignSelf: 'center',
                },
              ]}>
              <Text
                style={[
                  styles.downloadBtnText,
                  {fontSize: scaleFont(isMobile ? 14 : 16)},
                ]}>
                Yuklab olish
              </Text>
            </TouchableOpacity>
          ))}

        {status?.status === 'completed' && (
          <TouchableOpacity
            disabled
            style={[
              styles.downloadBtn,
              {
                opacity: 0.6,
                paddingVertical: isMobile ? 8 : 10,
                width: buttonWidth,
                alignSelf: 'center',
              },
            ]}>
            <Text
              style={[
                styles.downloadBtnText,
                {fontSize: scaleFont(isMobile ? 14 : 16)},
              ]}>
              Yuklab olingan
            </Text>
          </TouchableOpacity>
        )}

        {status?.status === 'downloading' && (
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              styles.cancelBtn,
              {
                paddingVertical: isMobile ? 6 : 8,
                width: buttonWidth,
                alignSelf: 'center',
              },
            ]}>
            <Text
              style={[
                styles.cancelBtnText,
                {fontSize: scaleFont(isMobile ? 14 : 16)},
              ]}>
              Bekor qilish
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default VideoInfo;

// =====================
// 🔹 STYLES
// =====================
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  meta: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusText: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  progressBarContainer: {
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
});
