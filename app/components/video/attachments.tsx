import React, { useEffect, useState, useRef } from 'react';
import {
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import api from '../../../core/api/apiService';
import { ImageViewerModal } from './ImageViewerModal';

type ContentItem = {
  id: number;
  type: 'TEXT' | 'IMAGE';
  textContent: string | null;
  resourceKey: string | null;
  orderNumber: number | null;
  downloadUrl: string | null;
};

export function Attachments({ id }: { id: string | number }) {
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  const panY = useRef(new Animated.Value(0)).current;
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const { width } = Dimensions.get('window');
  const isMobile = width < 600;
  console.log(id, 'id att');
  const fetchAttachments = async (id: string | number) => {
    try {
      const res = await api.get<ContentItem[]>(`services/videoedums/api/contents/media/${id}`);
      setAttachments(res.data || []);
    } catch (e: any) {
      console.error('Fetch Attachments Error:', e?.response?.data || e.message || e);
      setError('Failed to load attachments. Please try again.');
    }
  };

  useEffect(() => {
    if (id) fetchAttachments(id);
  }, [id]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }, []);

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    // Add event listener and store the subscription
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // Cleanup by calling remove on the subscription
    return () => subscription.remove();
  }, []);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  const openImage = (attachmentId: number) => {
    const imageOnly = attachments
      .filter(item => item.type === 'IMAGE' && item.downloadUrl)
      .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
    const index = imageOnly.findIndex(item => item.id === attachmentId);
    if (index !== -1) {
      setSelectedImageIndex(index);
      setImageError(false);
      setModalVisible(true);
    }
  };


  const closeImage = () => {
    setModalVisible(false);
    setSelectedImageIndex(null);
    Animated.timing(panY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Filter images for the modal
  const imageUrls = attachments
    .filter(item => item.type === 'IMAGE' && item.downloadUrl)
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
    .map(item => item.downloadUrl!);

  console.log(`attachments: ${attachments}`);
  return (
    <>
      <View style={[styles.container, { padding: isMobile ? 8 : 12 }]}>
        <Pressable onPress={toggle} style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]} hitSlop={8}>
          <Text style={[styles.title, { fontSize: isMobile ? 16 : 18 }]}>Darslikga oid ma'nbalar</Text>
          <View style={styles.headerRight}>
            {!expanded && (
              <Text style={[styles.moreText, { fontSize: isMobile ? 12 : 14 }]}>yana…</Text>
            )}
            {expanded ? (
              <ChevronUp size={isMobile ? 18 : 20} color="#475569" />
            ) : (
              <ChevronDown size={isMobile ? 18 : 20} color="#475569" />
            )}
          </View>
        </Pressable>

        {expanded && (
          <View style={styles.controlsRow}>
            <Pressable onPress={toggle} style={({ pressed }) => [styles.closePill, pressed && { opacity: 0.85 }]} hitSlop={8}>
              <X size={isMobile ? 12 : 14} color="#0f172a" />
              <Text style={[styles.closePillText, { fontSize: isMobile ? 11 : 12 }]}>Yopish</Text>
            </Pressable>
          </View>
        )}

        {expanded && (
          <View style={[styles.content, { gap: isMobile ? 8 : 12 }]}>
            {error ? (
              <Text style={[styles.errorText, { fontSize: isMobile ? 14 : 16 }]}>{error}</Text>
            ) : attachments.length === 0 ? (
              <Text style={[styles.emptyText, { fontSize: isMobile ? 14 : 16 }]}>No attachments available.</Text>
            ) : (
              attachments
                .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
                .map(item =>
                  item.type === 'IMAGE' && item.downloadUrl ? (
                    <Pressable key={item.id} onPress={() => openImage(item.id)} hitSlop={8}>
                      <Image
                        source={{ uri: item.downloadUrl }}
                        style={[styles.imageBlock, { height: isMobile ? 200 : 300 }]}
                        resizeMode="cover"
                        onError={() => console.log('Image load error')}
                      />
                    </Pressable>
                  ) : null
                )

            )}

            <Pressable onPress={toggle} style={[styles.seeLess]} hitSlop={8}>
              <ChevronUp size={isMobile ? 14 : 16} color="#0f172a" />
              <Text style={[styles.seeLessText, { fontSize: isMobile ? 12 : 13 }]}>Kamroq ko‘rsatish</Text>
            </Pressable>
          </View>
        )}
      </View>

      <ImageViewerModal
        visible={modalVisible}
        imageUrls={imageUrls}
        selectedIndex={selectedImageIndex}
        imageError={imageError}
        panY={panY}
        orientation={orientation}
        onClose={closeImage}
        onImageError={() => setImageError(true)}
        onIndexChange={setSelectedImageIndex}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: { fontWeight: 'bold', color: '#0f172a' },
  moreText: { color: '#475569' },
  controlsRow: { alignItems: 'flex-end', marginTop: 6 },
  closePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closePillText: { color: '#0f172a', fontWeight: '600' },
  content: { marginTop: 8 },
  imageBlock: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  seeLess: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  seeLessText: { color: '#0f172a', fontWeight: '600' },
  errorText: { color: '#e11d48', textAlign: 'center' },
  emptyText: { color: '#475569', textAlign: 'center' },
});
