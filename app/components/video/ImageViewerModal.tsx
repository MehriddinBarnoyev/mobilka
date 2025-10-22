import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRef } from 'react';
import { useScaling } from '../../../hooks/useScaling';

export const ImageViewerModal = ({
                                   visible,
                                   imageUrls,
                                   selectedIndex,
                                   imageError,
                                   panY,
                                   orientation,
                                   onClose,
                                   onImageError,
                                   onIndexChange,
                                 }) => {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { scaleFont, scaleSpacing } = useScaling();

  // 🔹 Gesture uchun threshold
  const SWIPE_THRESHOLD = 120;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10,

      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),

      onPanResponderRelease: (e, gestureState) => {
        if (Math.abs(gestureState.dy) > SWIPE_THRESHOLD) {
          // 🔹 Pastga yoki tepaga tortilganda yopiladi
          Animated.timing(panY, {
            toValue: gestureState.dy > 0 ? height : -height,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            panY.setValue(0);
            onClose();
          });
        } else {
          // 🔹 Juda oz harakat bo‘lsa, qayta joyiga qaytar
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const imgWidth = orientation === 'portrait' ? width : height;
  const imgHeight = orientation === 'portrait' ? height - top - bottom : width - top - bottom;

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      onIndexChange(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < imageUrls.length - 1) {
      onIndexChange(selectedIndex + 1);
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.imageContainer,
            { transform: [{ translateY: panY }], width, height: height - top - bottom },
          ]}
          {...panResponder.panHandlers}
        >
          {imageError || selectedIndex === null || !imageUrls[selectedIndex] ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { fontSize: scaleFont(16) }]}>Failed to load image</Text>
            </View>
          ) : (
            <Image
              source={{ uri: imageUrls[selectedIndex] }}
              style={[styles.image, { width: imgWidth, height: imgHeight }]}
              resizeMode="contain"
              onError={onImageError}
            />
          )}
        </Animated.View>

        {/* 🔹 Left/Right navigation */}
        {imageUrls.length > 1 && selectedIndex !== null && (
          <>
            {selectedIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.leftButton]}
                onPress={handlePrev}
                activeOpacity={0.7}
              >
                <ChevronLeft size={scaleFont(24)} color="#fff" />
              </TouchableOpacity>
            )}
            {selectedIndex < imageUrls.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.rightButton]}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <ChevronRight size={scaleFont(24)} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.closeButton, { top: top + scaleSpacing(10) }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <X size={scaleFont(22)} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  imageContainer: { justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  closeButton: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    padding: 8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
  },
  leftButton: { left: 10 },
  rightButton: { right: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff' },
});
