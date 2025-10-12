import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../type';
import api from '../../../core/api/apiService';
import auth from '../../../utils/auth';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const openedIds = new Set<string>();

export default function Otp(props: Props) {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const inputsRef = useRef<TextInput[]>([]);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { username, password, response } = props.route.params;
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 400;

  useEffect(() => {
    const id = response?.id;
    const url = response?.callBackUrl;
    if (!id || !url) return;

    if (openedIds.has(id)) return;
    openedIds.add(id);

    Linking.openURL(url).catch(err => {
      console.warn('Failed to open callback URL', err);
    });
  }, [response?.id, response?.callBackUrl]);

  // deep link handler stays as-is
  useEffect(() => {
    const onUrl = ({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);
        const maybeCode =
          parsed.searchParams.get('code') ||
          parsed.hash.replace(/^#/, '').split('code=')[1];
        if (maybeCode && /^\d{6}$/.test(maybeCode)) {
          const digits = maybeCode.split('');
          setOtp(digits);
          inputsRef.current[OTP_LENGTH - 1]?.focus();
        }
      } catch {}
    };

    const sub = Linking.addEventListener('url', onUrl);
    Linking.getInitialURL().then(initial => initial && onUrl({ url: initial }));
    return () => sub.remove();
  }, []);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else if (text.length > 1) {
      // pasted full OTP
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => (newOtp[i] = digit));
      setOtp(newOtp);
      inputsRef.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '') {
        if (index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // 3) Build the payload exactly as requested when submitting
  const handleSubmit = async () => {
    const codeStr = otp.join('');
    if (codeStr.length < OTP_LENGTH) {
      setError('Please enter the full OTP code.');
      return;
    }
    setError('');

    const payload = {
      otpVerification: {
        id: response.id,
        code: codeStr, // 6-digit number
      },
      loginVM: {
        username,
        password,
      },
    };

    console.log({ payload });

    const URL = 'services/userms/api/authenticate/verify';
    try {
      const res = await api.post(URL, payload);

      await auth.setToken(res.data.id_token);
      navigation.navigate('DevicesScreen');

      // let's remove input value after login
      setOtp(''.repeat(OTP_LENGTH).split(''));
    } catch (e) {
      console.log('OTP verification failed:', e);
      Alert.alert('Verification failed', 'Please try again later.');
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
        Enter OTP
      </Text>
      <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
        We&apos;ve sent a 6-digit code to your number/email
      </Text>

      <View
        style={[
          styles.otpContainer,
          isSmallScreen && styles.otpContainerSmall,
        ]}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              inputsRef.current[index] = ref!;
            }}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpInput,
              isSmallScreen && styles.otpInputSmall,
              error ? styles.otpInputError : null,
            ]}
            returnKeyType="done"
          />
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Submit OTP"
          onPress={handleSubmit}
          icon="check-circle"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: '5%', // Use percentage for responsive padding
    paddingVertical: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleSmall: {
    fontSize: 20, // Smaller font for small screens
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  subtitleSmall: {
    fontSize: 12, // Smaller font for small screens
  },
  otpContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: '10%', // Reduced padding for better fit
  },
  otpContainerSmall: {
    paddingHorizontal: '5%', // Even less padding for small screens
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  otpInputSmall: {
    width: 40, // Smaller input boxes for small screens
    height: 48,
    fontSize: 18,
  },
  otpInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
});