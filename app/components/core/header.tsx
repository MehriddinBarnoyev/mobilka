import {View, Text, StyleSheet, TouchableOpacity, PixelRatio, useWindowDimensions} from 'react-native';
import React from 'react';
import {Bell, Lock} from 'lucide-react-native';
import {useSecurity} from '../../../hooks/useSecurity';

import auth from '../../../utils/auth';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../type';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
}

export default function Header({title}: HeaderProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const {isSecured, setIsSecured} = useSecurity();
  const {top} = useSafeAreaInsets();

  // Font scaling based on screen density
      const scaleFont = (size: number) => {
          return Math.round(PixelRatio.roundToNearestPixel(size));
      };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const logOut = async () => {
    await auth.removeToken();
    navigation.replace('Home');
  };

  return (
    <View style={[styles.container, {paddingTop: 15}]}>
      <Text  style={[styles.title, { fontSize: scaleFont(isMobile ? 18 : 16) }]}>Profit Lab</Text>
      <TouchableOpacity onPress={() => setIsSecured(!isSecured)}>
        <Lock
          size={24}
          color="#111"
          style={{marginLeft: 'auto'}}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    flexDirection: 'row',
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  title: {
        fontWeight: '700',
        marginBottom: 20,
        color: '#1E293B',
        alignSelf: 'flex-start',
    },
});
