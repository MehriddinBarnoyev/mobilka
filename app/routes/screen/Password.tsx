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

export default function Password() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTime, setLockTime] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(60);

    const [serverPin, setServerPin] = useState<string | null>(null);
    const [isLoadingPin, setIsLoadingPin] = useState<boolean>(false);

    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
    const isMobile = width < 600;
    const isLandscape = width > height;

    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { setIsSecured } = useSecurity();

    // API pin fetch
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoadingPin(true);
                const res = await api.get('/services/userms/api/account');
                const apiPin = res?.data?.pinCode;
                const normalized =
                    apiPin == null ? null : String(apiPin).padStart(6, '0');
                if (!cancelled) setServerPin(normalized);
            } catch (e) {
                if (e instanceof AxiosError) {
                    if (e.response?.status === 401) {
                        auth.removeToken();
                        navigation.replace('Home');
                        return;
                    }
                }
                if (!cancelled)
                    setError('PINni yuklashda xatolik. Keyinroq urinib ko‘ring.');
            } finally {
                if (!cancelled) setIsLoadingPin(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleNumberPress = (number: string) => {
        if (isLocked || code.length >= 6) return;
        const updatedCode = code + number;
        setCode(updatedCode);
        setError('');
    };

    const handleSubmit = () => {
        if (isLocked || code.length !== 6) return;

        if (!serverPin) {
            setError('PIN hali tayyor emas. Iltimos, birozdan so‘ng urinib ko‘ring.');
            setCode('');
            return;
        }

        if (code === serverPin) {
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

    const handleBackspace = () => {
        if (code.length > 0) {
            setCode(code.slice(0, -1));
            setError('');
        }
    };

    // countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLocked && lockTime) {
            interval = setInterval(() => {
                const secondsLeft = Math.max(
                    0,
                    60 - Math.floor((Date.now() - lockTime.getTime()) / 1000),
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
                        {row.map((key, colIndex) => {
                            if (key === '') {
                                return <View key={`empty-${colIndex}`} style={styles.keypadButton} />;
                            } else if (key === '⌫') {
                                return (
                                    <TouchableOpacity
                                        key="backspace"
                                        onPress={handleBackspace}
                                        style={[
                                            styles.keypadButton,
                                            {
                                                width: isMobile ? rw(18) : rw(15),
                                                height: isMobile ? rw(18) : rw(15),
                                                borderRadius: rw(9),
                                            },
                                        ]}
                                        disabled={isLocked}>
                                        <Text style={[styles.keypadIcon, { fontSize: fs(22) }]}>⌫</Text>
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
                                                width: isMobile ? rw(18) : rw(15),
                                                height: isMobile ? rw(18) : rw(15),
                                                borderRadius: rw(9),
                                                backgroundColor: code.length === 6 ? '#007AFF' : '#F2F2F7',
                                            },
                                            (isLocked || isLoadingPin) && { opacity: 0.3 },
                                        ]}
                                        disabled={isLocked || isLoadingPin || code.length !== 6}>
                                        <Text
                                            style={[
                                                styles.keypadText,
                                                { fontSize: fs(24), color: code.length === 6 ? '#fff' : '#000' },
                                            ]}>
                                            OK
                                        </Text>
                                    </TouchableOpacity>
                                );
                            } else {
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => handleNumberPress(key)}
                                        style={[
                                            styles.keypadButton,
                                            {
                                                width: isMobile ? rw(18) : rw(15),
                                                height: isMobile ? rw(18) : rw(15),
                                                borderRadius: rw(9),
                                            },
                                            (isLocked || isLoadingPin) && { opacity: 0.3 },
                                        ]}
                                        disabled={isLocked || isLoadingPin}>
                                        <Text style={[styles.keypadText, { fontSize: fs(24) }]}>{key}</Text>
                                    </TouchableOpacity>
                                );
                            }
                        })}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                        <Text style={[styles.logoutButtonText, { fontSize: fs(14) }]}>Chiqish</Text>
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={[
                            styles.content,
                            isTablet && isLandscape && {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            },
                        ]}
                        keyboardShouldPersistTaps="handled">
                        {/* Info */}
                        <View
                            style={[
                                styles.infoContainer,
                                isTablet && isLandscape && {
                                    flex: 1,
                                    paddingRight: rw(4),
                                },
                            ]}>
                            <View style={[styles.lockIcon, { width: rw(20), height: rw(20), borderRadius: rw(10) }]}>
                                <Text style={[styles.lockIconText, { fontSize: fs(32) }]}>🔒</Text>
                            </View>
                            <Text style={[styles.title, { fontSize: fs(26) }]}>
                                Xavfsizlik kodi
                            </Text>
                            <Text style={[styles.subtitle, { fontSize: fs(15) }]}>
                                Iltimos, 6 xonali xavfsizlik kodini kiriting
                            </Text>

                            <View style={[styles.codeSection, { paddingVertical: rh(2) }]}>
                                {renderDots()}
                                {isLoadingPin && (
                                    <Text style={[styles.subtitle, { fontSize: fs(14) }]}>
                                        PIN yuklanmoqda…
                                    </Text>
                                )}
                                {!!error && (
                                    <Text style={[styles.errorText, { fontSize: fs(13) }]}>
                                        {error}
                                    </Text>
                                )}
                                {isLocked && (
                                    <Text style={[styles.errorText, { fontSize: fs(13) }]}>
                                        Bloklangan. Qayta urinib ko‘rish uchun {countdown} soniya kuting.
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Keypad */}
                        <View style={[styles.keypadWrapper, isTablet && isLandscape && { flex: 1 }]}>
                            {renderKeypad()}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flexGrow: 1, padding: rw(5) },
    infoContainer: { alignItems: 'center' },
    lockIcon: {
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: rh(2),
    },
    lockIconText: {},
    title: {
        fontWeight: '700',
        color: '#000',
        marginBottom: rh(1),
        textAlign: 'center',
    },
    subtitle: {
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    codeSection: { alignItems: 'center' },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: rh(1),
    },
    dot: { marginHorizontal: rw(1.5), borderWidth: 2 },
    dotEmpty: { backgroundColor: 'transparent', borderColor: '#E5E5EA' },
    dotFilled: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    errorText: {
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: rh(1),
    },
    keypadWrapper: { marginTop: rh(2), alignItems: 'center' },
    keypadContainer: { alignItems: 'center' },
    keypadRow: { flexDirection: 'row', marginBottom: rh(2) },
    keypadButton: {
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: rw(3),
    },
    keypadText: { color: '#000' },
    keypadIcon: { color: '#007AFF' },
    logoutButton: {
        position: 'absolute',
        backgroundColor: '#F2F2F7',
        borderRadius: rw(5),
        paddingVertical: rh(1),
        paddingHorizontal: rw(3),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        elevation: 5,
    },
    logoutButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        textAlign: 'center',
    },
});