import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import api from '../../../core/api/apiService';
import auth from '../../../utils/auth';
import { useSecurity } from '../../../hooks/useSecurity';
import { useNetwork } from '../../../hooks/NetworkProvider';
import { RootStackParamList } from '../../../type';
import { responsiveWidth as rw, responsiveHeight as rh } from '../../../utils/responsive';
import { fontScale as fs } from '../../../utils/fontScale';

export default function Password() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [pinCode, setPinCode] = useState<string | null>(null);

  const { isOnline } = useNetwork();
  const { setIsSecured } = useSecurity();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      try {
        const localPin = await AsyncStorage.getItem('pinCode');

        if (isMounted && localPin) {
          setPinCode(localPin);
          console.log('[PIN] Local PIN topildi:', localPin);
        }

        if (isOnline) {
          try {
            const res = await api.get('/services/userms/api/account');
            const apiPin = res?.data?.pinCode;
            if (apiPin && isMounted) {
              const normalizedPin = String(apiPin).padStart(6, '0');
              await AsyncStorage.setItem('pinCode', normalizedPin);
              setPinCode(normalizedPin);
              console.log('[PIN] Serverdan yangilandi:', normalizedPin);
            }
          } catch (err) {
            console.log('[PIN] Serverdan olishda xato:', err);
          }
        } else {
          if (!localPin) {
            setError('Offline rejimda PIN mavjud emas. Internetga ulanib qayta urinib ko‘ring.');
          } else {
            console.log('[PIN] Offline rejimda local PIN ishlatyapti');
          }
        }
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 401) {
          await auth.removeToken();
          navigation.replace('Home');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const handleSubmit = async () => {
    if (isLocked || code.length !== 6) return;

    if (!pinCode) {
      setError('PIN mavjud emas. Internetga ulanib qayta urinib ko‘ring.');
      setCode('');
      return;
    }

    if (code === pinCode) {
      setIsSecured(true);
      navigation.replace('Protection');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockTime(new Date());
        setCountdown(60);
        setError('5 marta noto‘g‘ri urinish. 1 daqiqadan so‘ng urinib ko‘ring.');
      } else {
        setError(`Noto‘g‘ri kod. Urinishlar: ${newAttempts}/5`);
      }
      setCode('');
    }
  };

  // Blok taymeri
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTime) {
      interval = setInterval(() => {
        const secondsLeft = Math.max(0, 60 - Math.floor((Date.now() - lockTime.getTime()) / 1000));
        setCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          setIsLocked(false);
          setAttempts(0);
          setLockTime(null);
          setError('');
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTime]);

  const handleNumberPress = (num: string) => {
    if (isLocked || code.length >= 6) return;
    setCode(code + num);
    setError('');
  };

  const handleBackspace = () => {
    if (code.length > 0) setCode(code.slice(0, -1));
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < code.length ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );

  const renderKeypad = () => {
    const layout = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['⌫', '0', 'OK']];
    return (
      <View style={styles.keypadContainer}>
        {layout.map((row, i) => (
          <View key={i} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={
                  key === '⌫'
                    ? handleBackspace
                    : key === 'OK'
                    ? handleSubmit
                    : () => handleNumberPress(key)
                }
                style={[
                  styles.keypadButton,
                  key === 'OK' && {
                    backgroundColor: code.length === 6 ? '#007AFF' : '#E5E5EA',
                  },
                ]}
                disabled={isLocked || (key === 'OK' && code.length !== 6)}
              >
                <Text
                  style={[
                    styles.keypadText,
                    key === 'OK' && { color: code.length === 6 ? '#fff' : '#000' },
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <TouchableOpacity
            onPress={() => {
              auth.removeToken();
              navigation.replace('Home');
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Chiqish</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.title}>Xavfsizlik kodi</Text>
            <Text style={styles.subtitle}>6 xonali PIN kiriting</Text>

            {isLoading ? (
              <Text style={styles.infoText}>PIN yuklanmoqda...</Text>
            ) : !isOnline ? (
              <Text style={styles.infoText}>Offline rejimda ishlayapsiz</Text>
            ) : null}

            {renderDots()}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {isLocked && <Text style={styles.errorText}>Bloklangan {countdown}s</Text>}

            {renderKeypad()}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  lockIcon: { fontSize: fs(30), marginBottom: rh(1) },
  title: { fontWeight: '700', fontSize: fs(22), color: '#000' },
  subtitle: { color: '#8E8E93', marginBottom: rh(2) },
  dotsContainer: { flexDirection: 'row', marginVertical: rh(2) },
  dot: { width: rw(5), height: rw(5), borderRadius: rw(2.5), marginHorizontal: rw(1.5), borderWidth: 2 },
  dotEmpty: { borderColor: '#E5E5EA' },
  dotFilled: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  errorText: { color: '#FF3B30', textAlign: 'center', marginTop: rh(1) },
  infoText: { color: '#8E8E93', textAlign: 'center', marginTop: rh(1) },
  keypadContainer: { marginTop: rh(2), alignItems: 'center' },
  keypadRow: { flexDirection: 'row', marginBottom: rh(2) },
  keypadButton: { width: rw(18), height: rw(18), borderRadius: rw(9), backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginHorizontal: rw(3) },
  keypadText: { fontSize: fs(22), color: '#000' },
  logoutButton: { position: 'absolute', top: rh(3), right: rw(3), backgroundColor: '#F2F2F7', borderRadius: rw(4), paddingHorizontal: rw(4), paddingVertical: rh(1) },
  logoutText: { color: '#007AFF', fontWeight: '600' },
});
