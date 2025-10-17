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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSecurity } from '../../../hooks/useSecurity';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../type';
import {
  responsiveWidth as rw,
  responsiveHeight as rh,
} from '../../../utils/responsive';
import { fontScale as fs } from '../../../utils/fontScale';
import api from '../../../core/api/apiService';
import auth from '../../../utils/auth';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetwork } from '../../../hooks/NetworkProvider';

export default function Password() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  const [pinCode, setPinCode] = useState<string | null>(null); // <-- faqat bitta pin
  const isConnected = useNetwork();

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isMobile = width < 600;
  const isLandscape = width > height;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setIsSecured } = useSecurity();

  // 🔹 PIN olish (avval localdan, keyin agar internet bo‘lsa serverdan yangilash)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);

        // 1️⃣ Avvalo localdan o‘qib olamiz
        const localPin = await AsyncStorage.getItem('pinCode');
        if (localPin && !cancelled) {
          console.log('[PIN] Localdan olindi:', localPin);
          setPinCode(localPin);
        }

        // 2️⃣ Agar internet bor bo‘lsa, serverdan yangisini olib kelamiz
        if (isConnected) {
          const res = await api.get('/services/userms/api/account');
          const apiPin = res?.data?.pinCode;
          console.log('[PIN] Serverdan olindi:', apiPin);

          if (apiPin) {
            const normalizedPin = String(apiPin).padStart(6, '0');
            await AsyncStorage.setItem('pinCode', normalizedPin);
            if (!cancelled) setPinCode(normalizedPin);
          } else {
            if (!cancelled) setError('Serverda PIN topilmadi.');
          }
        } else if (!localPin) {
          if (!cancelled)
            setError(
              'Siz offline holatdasiz va PIN hali saqlanmagan. Internetga ulanib qayta urinib ko‘ring.'
            );
        }
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 401) {
          auth.removeToken();
          navigation.replace('Home');
          return;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  // 🔐 PIN tekshirish
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
        setError(`Noto‘g‘ri kod. Urinishlar soni: ${newAttempts}/5`);
      }
      setCode('');
    }
  };

  // 🔙 Orqaga o‘chirish
  const handleBackspace = () => {
    if (code.length > 0) {
      setCode(code.slice(0, -1));
      setError('');
    }
  };

  // 🕒 Blok taymeri
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTime) {
      interval = setInterval(() => {
        const secondsLeft = Math.max(
          0,
          60 - Math.floor((Date.now() - lockTime.getTime()) / 1000)
        );
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

  // render dots
  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < code.length ? styles.dotFilled : styles.dotEmpty,
            {
              width: isMobile ? rw(4) : rw(3),
              height: isMobile ? rw(4) : rw(3),
              borderRadius: isMobile ? rw(2) : rw(1.5),
            },
          ]}
        />
      ))}
    </View>
  );

  // render keypad
  const renderKeypad = () => {
    const keypadLayout = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['⌫', '0', 'OK'],
    ];

    return (
      <View style={styles.keypadContainer}>
        {keypadLayout.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === '⌫') {
                return (
                  <TouchableOpacity
                    key="backspace"
                    onPress={handleBackspace}
                    style={styles.keypadButton}
                    disabled={isLocked}
                  >
                    <Text style={styles.keypadIcon}>⌫</Text>
                  </TouchableOpacity>
                );
              } else if (key === 'OK') {
                return (
                  <TouchableOpacity
                    key="ok"
                    onPress={handleSubmit}
                    style={[
                      styles.keypadButton,
                      {
                        backgroundColor:
                          code.length === 6 ? '#007AFF' : '#F2F2F7',
                      },
                    ]}
                    disabled={isLocked || isLoading || code.length !== 6}
                  >
                    <Text
                      style={[
                        styles.keypadText,
                        { color: code.length === 6 ? '#fff' : '#000' },
                      ]}
                    >
                      OK
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => handleNumberPress(key)}
                    style={styles.keypadButton}
                    disabled={isLocked || isLoading}
                  >
                    <Text style={styles.keypadText}>{key}</Text>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        ))}
      </View>
    );
  };

  const handleNumberPress = (number: string) => {
    if (isLocked || code.length >= 6) return;
    setCode(code + number);
    setError('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Logout */}
          <TouchableOpacity
            onPress={() => {
              auth.removeToken();
              navigation.replace('Home');
            }}
            style={[styles.logoutButton, { top: rh(3), right: rw(3) }]}
          >
            <Text style={styles.logoutButtonText}>Chiqish</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.infoContainer}>
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔒</Text>
              </View>
              <Text style={styles.title}>Xavfsizlik kodi</Text>
              <Text style={styles.subtitle}>
                Iltimos, 6 xonali xavfsizlik kodini kiriting
              </Text>

              <View style={styles.codeSection}>
                {renderDots()}
                {isLoading && <Text>PIN yuklanmoqda…</Text>}
                {!!error && <Text style={styles.errorText}>{error}</Text>}
                {isLocked && (
                  <Text style={styles.errorText}>
                    Bloklangan. {countdown} soniya kuting.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.keypadWrapper}>{renderKeypad()}</View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: rw(5), alignItems: 'center' },
  infoContainer: { alignItems: 'center' },
  lockIcon: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rh(2),
    borderRadius: rw(10),
    width: rw(20),
    height: rw(20),
  },
  lockIconText: { fontSize: fs(32) },
  title: {
    fontWeight: '700',
    color: '#000',
    marginBottom: rh(1),
    textAlign: 'center',
    fontSize: fs(26),
  },
  subtitle: { color: '#8E8E93', textAlign: 'center' },
  codeSection: { alignItems: 'center', paddingVertical: rh(2) },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: rh(1),
  },
  dot: { marginHorizontal: rw(1.5), borderWidth: 2 },
  dotEmpty: { backgroundColor: 'transparent', borderColor: '#E5E5EA' },
  dotFilled: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  errorText: { color: '#FF3B30', textAlign: 'center', marginTop: rh(1) },
  keypadWrapper: { marginTop: rh(2), alignItems: 'center' },
  keypadContainer: { alignItems: 'center' },
  keypadRow: { flexDirection: 'row', marginBottom: rh(2) },
  keypadButton: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: rw(3),
    width: rw(18),
    height: rw(18),
    borderRadius: rw(9),
  },
  keypadText: { color: '#000', fontSize: fs(24) },
  keypadIcon: { color: '#007AFF', fontSize: fs(22) },
  logoutButton: {
    position: 'absolute',
    backgroundColor: '#F2F2F7',
    borderRadius: rw(5),
    paddingVertical: rh(1),
    paddingHorizontal: rw(3),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoutButtonText: { color: '#007AFF', fontWeight: '600' },
});
