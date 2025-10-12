import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {responsiveWidth as rw, responsiveHeight as rh} from '../../utils/responsive';
import {fontScale as fs} from '../../utils/fontScale';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../type';
import api from '../../core/api/apiService';

type UserAccount = {
  login: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  designedName: string | null;
  imageUrl: string | null;
  activated: boolean;
  langKey: string | null;
  authorities?: string[];
};

const PIN_LENGTH = 6;

export default function CreatePinCode() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [userLoadError, setUserLoadError] = useState<string>('');

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const canInteract = useMemo(
    () => !isSubmitting && !isUserLoading && !!user,
    [isSubmitting, isUserLoading, user],
  );

  const getUser = useCallback(async () => {
    setIsUserLoading(true);
    setUserLoadError('');
    try {
      const res = await api.get('/services/userms/api/account');
      if (!isMounted.current) return;
      setUser(res.data as UserAccount);
    } catch (e) {
      if (!isMounted.current) return;
      setUserLoadError("Foydalanuvchi ma’lumotlarini yuklashda xatolik.");
    } finally {
      if (isMounted.current) setIsUserLoading(false);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const resetPin = useCallback(() => setPin(''), []);

  const submitPin = useCallback(
    async (value: string) => {
      if (!user) {
        setError("Foydalanuvchi ma’lumotlari hali tayyor emas.");
        return;
      }
      // basic validation
      if (value.length !== PIN_LENGTH || !/^\d+$/.test(value)) {
        setError('PIN faqat 6 ta raqamdan iborat bo‘lishi kerak.');
        resetPin();
        return;
      }

      const payload = {
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        designedName: user.designedName,
        imageUrl: user.imageUrl,
        activated: user.activated,
        langKey: 'en',
        authorities:
          (user.authorities && user.authorities.length > 0
            ? user.authorities
            : [
                'VIEW_VIDEOS',
                'MOBILE_VIEW_VIDEOS',
                'MOBILE_VIEW_GROUPS',
                'VIEW_GROUP',
              ]),
        pinCode: value,
      };

      setIsSubmitting(true);
      setError('');

      try {
        await api.post('/services/userms/api/change-pincode', payload);
        Alert.alert('Muvaffaqiyatli', 'PIN kod muvaffaqiyatli saqlandi', [
          {text: 'OK', onPress: () => navigation.replace('Protection')},
        ]);
      } catch (err) {
        setError('PINni saqlab bo‘lmadi. Qayta urinib ko‘ring.');
      } finally {
        if (isMounted.current) {
          setIsSubmitting(false);
          resetPin();
        }
      }
    },
    [navigation, resetPin, user],
  );

  const handleNumberPress = useCallback(
    (digit: string) => {
      if (!canInteract) return;
      if (pin.length >= PIN_LENGTH) return;
      if (!/^\d$/.test(digit)) return; // safety

      const next = pin + digit;
      setPin(next);
      setError('');

      if (next.length === PIN_LENGTH) {
        // submit immediately on 6 digits
        submitPin(next);
      }
    },
    [canInteract, pin, submitPin],
  );

  const handleBackspace = useCallback(() => {
    if (pin.length === 0 || !canInteract) return;
    setPin((p) => p.slice(0, -1));
    setError('');
  }, [pin.length, canInteract]);

  const handleClearLongPress = useCallback(() => {
    if (!canInteract) return;
    resetPin();
  }, [canInteract, resetPin]);

  const renderDots = useMemo(
    () => (
      <View style={styles.dotsContainer}>
        {Array.from({length: PIN_LENGTH}).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </View>
    ),
    [pin.length],
  );

  const keypadLayout = useMemo(
    () => [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫'],
    ],
    [],
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.infoContainer}>
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔐</Text>
              </View>

              <Text style={styles.title}>
                Yangi PIN kod {user?.firstName ?? ''} {user?.lastName ?? ''} uchun
              </Text>

              <Text style={styles.subtitle}>
                Iltimos, yangi {PIN_LENGTH} xonali xavfsizlik kodini yarating
              </Text>

              {isUserLoading ? (
                <View style={{paddingVertical: rh(2)}}>
                  <ActivityIndicator />
                  <Text style={[styles.subtitle, {marginTop: rh(1)}]}>
                    Foydalanuvchi yuklanmoqda…
                  </Text>
                </View>
              ) : userLoadError ? (
                <View style={{paddingVertical: rh(2), alignItems: 'center'}}>
                  <Text style={styles.errorText}>{userLoadError}</Text>
                  <TouchableOpacity
                    onPress={getUser}
                    style={[styles.retryBtn, {marginTop: rh(1.5)}]}>
                    <Text style={styles.retryBtnText}>Qayta urinish</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.codeSection}>
                {renderDots}
                {!!error && <Text style={styles.errorText}>{error}</Text>}
                {isSubmitting && (
                  <Text style={styles.subtitle}>Saqlanmoqda…</Text>
                )}
              </View>
            </View>

            <View style={styles.keypadWrapper}>
              <View style={styles.keypadContainer}>
                {keypadLayout.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keypadRow}>
                    {row.map((key, colIndex) => {
                      if (key === '') {
                        return <View key={`empty-${colIndex}`} style={styles.keypadButton} />;
                      }
                      if (key === '⌫') {
                        return (
                          <TouchableOpacity
                            key="backspace"
                            onPress={handleBackspace}
                            onLongPress={handleClearLongPress}
                            delayLongPress={250}
                            style={[
                              styles.keypadButton,
                              (!canInteract || pin.length === 0) && {opacity: 0.3},
                            ]}
                            disabled={!canInteract || pin.length === 0}
                            accessibilityLabel="Backspace"
                            accessibilityHint="Delete the last digit"
                          >
                            <Text style={styles.keypadIcon}>⌫</Text>
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={key}
                          onPress={() => handleNumberPress(key)}
                          style={[styles.keypadButton, !canInteract && {opacity: 0.3}]}
                          disabled={!canInteract}
                          accessibilityLabel={`Raqam ${key}`}
                        >
                          <Text style={styles.keypadText}>{key}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {flexGrow: 1, padding: rw(5)},
  infoContainer: {alignItems: 'center'},
  lockIcon: {
    width: rw(20),
    height: rw(20),
    borderRadius: rw(10),
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rh(2),
  },
  lockIconText: {fontSize: fs(32)},
  title: {
    fontSize: fs(26),
    fontWeight: '700',
    color: '#000',
    marginBottom: rh(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fs(15),
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  codeSection: {alignItems: 'center', paddingVertical: rh(3)},
  dotsContainer: {flexDirection: 'row', justifyContent: 'center', marginBottom: rh(1)},
  dot: {width: rw(4), height: rw(4), borderRadius: rw(2), marginHorizontal: rw(2), borderWidth: 2},
  dotEmpty: {backgroundColor: 'transparent', borderColor: '#E5E5EA'},
  dotFilled: {backgroundColor: '#34C759', borderColor: '#34C759'},
  errorText: {color: '#FF3B30', fontSize: fs(13), textAlign: 'center', marginTop: rh(1)},
  keypadWrapper: {marginTop: rh(2)},
  keypadContainer: {alignItems: 'center'},
  keypadRow: {flexDirection: 'row', marginBottom: rh(2)},
  keypadButton: {
    width: rw(18),
    height: rw(18),
    borderRadius: rw(9),
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: rw(3),
  },
  keypadText: {fontSize: fs(24), color: '#000'},
  keypadIcon: {fontSize: fs(22), color: '#007AFF'},
  retryBtn: {
    paddingHorizontal: rw(4),
    paddingVertical: rh(1.2),
    borderRadius: rw(3),
    backgroundColor: '#007AFF',
  },
  retryBtnText: {color: '#fff', fontWeight: '600', fontSize: fs(14)},
});
