import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    Linking,
    ActivityIndicator,
    StyleSheet, Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VersionCheck from 'react-native-version-check';
import { enableScreens } from 'react-native-screens';
import NativeControlsScreen from './vdocipher/NativeControlsScreen';
import JSControlsScreen from './vdocipher/JSControlsScreen';
import DownloadsScreen from './vdocipher/DownloadsScreen';
import PlaylistScreen from './vdocipher/PlaylistScreen';
import AuthGate from './AuthGate';
import Otp from './auth/otp/Otp';
import DevicesScreen from './screens/DevicesScreen';
import LoginScreen from './auth/Login';
import { GroupDetail } from './screens/gropDetail';
import PlaylistDetail from './screens/playlistDetail';
import VideoScreen from './screens/VideoScreen';

import { RootStackParamList } from '../type';
import { navigationRef } from '../core/navigationService';
import {UserProvider} from "../context/UserContext";

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

const UpdateScreen = ({ storeUrl }: { storeUrl: string }) => (
    <View style={styles.container}>
        <Text style={styles.title}>Yangi versiya mavjud 🚀</Text>
        <Button title="Update qilish" onPress={() => Linking.openURL(storeUrl)} />
    </View>
);

export default function App() {
    const [checking, setChecking] = useState(true);
    const [needUpdate, setNeedUpdate] = useState(false);
    const [storeUrl, setStoreUrl] = useState('');

    useEffect(() => {
        const checkVersion = async () => {
            try {
                VersionCheck.needUpdate({
                    packageName: "com.assoodiq.devops",
                })
                const updateNeeded = await VersionCheck.needUpdate();
                if (updateNeeded?.isNeeded) {
                    setNeedUpdate(true);
                    setStoreUrl(Platform.OS === 'android' ? 'https://play.google.com/store/apps/details?id=com.assoodiq.devops' : 'K3YMN933H9.uz.devops.assoodiq');
                }
            } catch (error) {
                console.log('Version check error:', error);
            } finally {
                setChecking(false);
            }
        };

        checkVersion();
    }, []);
    if (checking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Versiya tekshirilmoqda...</Text>
            </View>
        );
    }

    if (needUpdate) {
        return <UpdateScreen storeUrl={storeUrl} />;
    }
    return (
        <UserProvider>
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={AuthGate}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="NativeControls"
                    component={NativeControlsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="JSControls"
                    component={JSControlsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Downloads"
                    component={DownloadsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Playlist"
                    component={PlaylistScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Otp"
                    component={Otp}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="DevicesScreen"
                    component={DevicesScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="GroupDetail"
                    component={GroupDetail}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PlaylistDetail"
                    component={PlaylistDetail}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="VideoScreen"
                    component={VideoScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
        </UserProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
});
