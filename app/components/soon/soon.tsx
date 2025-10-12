import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function Soon() {
  return (
    <View style={styles.overlay}>
      <View style={styles.soonBox}>
        <Text style={styles.soonText}>Coming Soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // covers parent
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // fake blur
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 8,
  },
  soonBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  soonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
