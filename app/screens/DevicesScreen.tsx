import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import DeviceInfo from 'react-native-device-info';
import api from '../../core/api/apiService';
import { RootStackParamList } from '../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSecurity } from '../../hooks/useSecurity';

export interface UserResponse {
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: number;
    login: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    skipAuth?: boolean;
}

interface DeviceBinding {
    createdBy: string;
    createdDate: string; // ISO
    lastModifiedBy: string; // ISO
    lastModifiedDate: string;
    id: number;
    deviceId: string;
    userLogin: string;
    status: 'ACTIVE' | 'INACTIVE' | string;
}

interface CheckResponse {
    allowed: boolean;
    devices: DeviceBinding[];
}

interface ErrorBodyMaybe extends Partial<CheckResponse> {
    message?: string;
}

// ---------- API Paths ----------
const ACCOUNT_PATH = '/services/userms/api/account';
const CHECK_PATH = '/services/videoedums/api/device-bindings/check';
const DELETE_PATH = (id: number) =>
    `/services/videoedums/api/device-bindings/${id}`;

// ---------- Colors (light, modern) ----------
const COLORS = {
    bg: '#FAFAFF',
    card: '#FFFFFF',
    ink: '#0B1020',
    sub: '#667085',
    line: '#E8ECF3',
    primary: '#2463EB',
    primarySoft: '#E9F0FF',
    success: '#16A34A',
    successSoft: '#EAF7EE',
    warn: '#E11D48',
    warnSoft: '#FFE9EE',
    amber: '#F59E0B',
    amberSoft: '#FFF7E6',
    slateSoft: '#F5F7FB',
};

// ---------- Component ----------
export default function DevicesScreen(): JSX.Element {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();

    const { isSecured, setIsSecured } = useSecurity();

    // Check if navigated from Account page
    const fromAccount = (route.params as { fromAccount?: boolean })?.fromAccount || false;
    console.log(route.params, 'route.params');

    console.log(fromAccount, 'fromAccount');

    // bootstrap
    const [userLogin, setUserLogin] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    // ui & data
    const [checking, setChecking] = useState<boolean>(true); // request spinner
    const [loadingList, setLoadingList] = useState<boolean>(true);
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const [devices, setDevices] = useState<DeviceBinding[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const payload = useMemo(() => {
        if (!userLogin || !deviceId ) return null;
        return { deviceId, userLogin, status: 'ACTIVE' as const };
    }, [userLogin, deviceId]);

    const formatDate = (iso: string): string => {
        try {
            return new Date(iso).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
        } catch {
            return iso;
        }
    };

    const applyServerData = (data: unknown) => {
        const body = data as ErrorBodyMaybe | CheckResponse | undefined;
        if (body && typeof body === 'object') {
            if (typeof (body as CheckResponse).allowed === 'boolean') {
                setAllowed((body as CheckResponse).allowed);
            } else {
                setAllowed(null);
            }

            const arr = Array.isArray((body as CheckResponse).devices)
                ? (body as CheckResponse).devices
                : [];

            setDevices(arr);
            return true;
        }
        return false;
    };


    const checkDevices = useCallback(async (): Promise<void> => {
        if (!payload) return;
        setErrorMsg('');
        setChecking(true);
        setLoadingList(true);
        try {
            const res = await api.post<CheckResponse>(CHECK_PATH, payload);
            applyServerData(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const aerr = err as AxiosError<ErrorBodyMaybe>;
                if (aerr.response?.data && applyServerData(aerr.response.data)) {
                } else {
                    const status = aerr.response?.status;
                    setErrorMsg(
                        status ? `So'rov xatosi: ${status}` : 'Tarmoq yoki server xatosi',
                    );
                    setAllowed(prev => (prev === null ? false : prev));
                }
            } else {
                setErrorMsg("Noma'lum xato yuz berdi");
            }
        } finally {
            setChecking(false);
            setLoadingList(false);
        }
    }, [payload]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await checkDevices();
        setRefreshing(false);
    }, []);

    const removeDevice = useCallback(
        (id: number) => {
            console.log('removing started ', id);
            Alert.alert(
                'Qurilmani o‘chirish',
                'Ushbu qurilmani faol seanslardan olib tashlamoqchimisiz?',
                [
                    { text: 'Bekor qilish', style: 'cancel' },
                    {
                        text: 'O‘chirish',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                console.log('removing started2', id);
                                await api.delete<void>(DELETE_PATH(id));
                                await checkDevices();
                                setTimeout(() => {
                                    setDevices(prev => prev.filter(d => d.id !== id));
                                    if (allowed === true) {
                                        navigation.replace('Home');
                                        setIsSecured(true);
                                    }
                                }, 300);
                            } catch (e: unknown) {
                                const msg =
                                    (axios.isAxiosError(e) &&
                                        (e.response?.data as ErrorBodyMaybe)?.message) ||
                                    (e as Error)?.toString() ||
                                    'O‘chirish muvaffaqiyatsiz yakunlandi';
                                Alert.alert('Xatolik', msg);
                            }
                        },
                    },
                ],
            );
        },
        [checkDevices, navigation, allowed, setIsSecured],
    );

    useEffect(() => {
        (async () => {
            try {
                const userRes = await api.get<UserResponse>(ACCOUNT_PATH);
                setUserLogin(userRes.data.login);
            } catch {
                setErrorMsg('Foydalanuvchi ma’lumotlarini olishda xatolik');
            }
            try {
                const id = await DeviceInfo.getUniqueId();
                setDeviceId(id || null);
            } catch {
                setErrorMsg('Qurilma ID olinmadi');
            }
        })();
    }, []);

    useEffect(() => {
        if (payload) void checkDevices();
    }, [payload, checkDevices]);

    // ---------- UI subcomponents ----------
    const Header = (): JSX.Element => (
        <View style={styles.header}>
            <Text style={styles.title}>Faol qurilmalar </Text>

            {!userLogin || !deviceId ? (
                <Banner status="loading" text="Boshlang‘ich yuklanmoqda…" />
            ) : checking ? (
                <Banner status="loading" text="Tekshirilmoqda…" />
            ) : allowed === true ? (
                <Banner status="ok" text="Ruxsat berilgan" />
            ) : allowed === false ? (
                <Banner status="warn" text="Ruxsat berilmagan — qurilmalar ko‘p" />
            ) : null}

            {!!errorMsg && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorTitle}>Xatolik</Text>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}

            {allowed === false && (
                <View style={styles.notice}>
                    <Text style={styles.noticeTitle}>Amal zarur</Text>
                    <Text style={styles.noticeText}>
                        Maksimal qurilmalar soniga yetdingiz. Davom etish uchun pastdan
                        kamida bitta qurilmani o‘chiring va qayta tekshiring.
                    </Text>
                </View>
            )}
        </View>
    );

    const DeviceCard = ({ item }: { item: DeviceBinding }): JSX.Element => {
        const isActive = item.status === 'ACTIVE';
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{item.deviceId}</Text>
                    <View
                        style={[
                            styles.badge,
                            isActive ? styles.badgeActive : styles.badgeMuted,
                        ]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Foydalanuvchi</Text>
                    <Text style={styles.metaVal}>{item.userLogin}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Yaratildi</Text>
                    <Text style={styles.metaVal}>{formatDate(item.createdDate)}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Yangilandi</Text>
                    <Text style={styles.metaVal}>
                        {formatDate(item.lastModifiedDate)}
                    </Text>
                </View>

                {allowed === false && (
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeDevice(item.id)}>
                        <Text style={styles.deleteBtnText}>Ushbu qurilmani o‘chirish</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const Footer = (): JSX.Element | null => {
        // Hide the "Davom etish" button if navigated from Account
        if (fromAccount) {
            return null;
        }
        // Show the button only if allowed is true
        if (allowed === true) {
            return (
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                        navigation.replace('Home');
                        setIsSecured(!isSecured);
                    }}>
                    <Text style={styles.primaryBtnText}>Davom etish</Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
            <FlatList<DeviceBinding>
                data={devices}
                keyExtractor={d => String(d.id)}
                ListHeaderComponent={Header}
                renderItem={({ item }) => <DeviceCard item={item} />}
                ListEmptyComponent={
                    loadingList ? null : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyTitle}>Seans topilmadi</Text>
                            <Text style={styles.emptyText}>
                                Faol qurilmalar ro‘yxati bo‘sh.
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={Footer}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </SafeAreaView>
    );
}

// ---------- Small Banner ----------
function Banner({
    status,
    text,
}: {
    status: 'loading' | 'ok' | 'warn';
    text: string;
}) {
    const styleMap =
        status === 'loading'
            ? { box: styles.pillLoading, dot: styles.dotAmber, label: styles.pillText }
            : status === 'ok'
                ? { box: styles.pillOk, dot: styles.dotOk, label: styles.pillText }
                : { box: styles.pillWarn, dot: styles.dotWarn, label: styles.pillText };

    return (
        <View style={[styles.pill, styleMap.box]}>
            <View style={[styles.dot, styleMap.dot]} />
            {status === 'loading' && <ActivityIndicator size="small" />}
            <Text style={styleMap.label}> {text}</Text>
        </View>
    );
}

// ---------- Styles (Light Mode, attractive palette) ----------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 16, paddingBottom: 32 },

    header: { marginBottom: 12 },
    title: { color: COLORS.ink, fontSize: 24, fontWeight: '800', marginBottom: 10 },

    // Banner
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    pillLoading: { backgroundColor: COLORS.amberSoft, borderColor: '#FFE2B8' },
    pillOk: { backgroundColor: COLORS.successSoft, borderColor: '#CFECD7' },
    pillWarn: { backgroundColor: COLORS.warnSoft, borderColor: '#FFC7D0' },
    pillText: { color: COLORS.ink, fontWeight: '700' },
    dot: { width: 8, height: 8, borderRadius: 99, marginRight: 8 },
    dotOk: { backgroundColor: COLORS.success },
    dotWarn: { backgroundColor: COLORS.warn },
    dotAmber: { backgroundColor: COLORS.amber },

    // Error + Notice
    errorBox: {
        backgroundColor: COLORS.warnSoft,
        borderColor: '#FFC7D0',
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginTop: 6,
    },
    errorTitle: { color: COLORS.warn, fontWeight: '800', marginBottom: 4 },
    errorText: { color: COLORS.ink },
    notice: {
        backgroundColor: COLORS.slateSoft,
        borderWidth: 1,
        borderColor: COLORS.line,
        borderRadius: 14,
        padding: 12,
        marginTop: 10,
    },
    noticeTitle: { color: COLORS.ink, fontWeight: '800', marginBottom: 4 },
    noticeText: { color: COLORS.sub },

    // Cards
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.line,
        padding: 16,
        marginTop: 12,
        shadowColor: '#1b1f3b',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },

    // Status badge
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeActive: { backgroundColor: COLORS.primarySoft },
    badgeMuted: { backgroundColor: COLORS.slateSoft },
    badgeText: { color: COLORS.ink, fontWeight: '700', fontSize: 12 },

    // Meta rows
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    metaKey: { color: COLORS.sub, fontWeight: '600' },
    metaVal: { color: COLORS.ink, fontWeight: '700' },

    // Actions
    deleteBtn: {
        marginTop: 14,
        backgroundColor: COLORS.warnSoft,
        borderColor: '#FFC7D0',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    deleteBtnText: { color: COLORS.warn, fontWeight: '800' },

    primaryBtn: {
        marginTop: 18,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#2463EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 3,
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 0.3,
    },

    // Empty
    empty: {
        paddingVertical: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        color: COLORS.ink,
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    emptyText: { color: COLORS.sub },
});