// /routes/MainScreen.tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Search from '../Search';
import Account from '../Account';
import {
    Home as HomeIcon,
    Search as SearchIcon,
    User as UserIcon,
} from 'lucide-react-native';
import {Platform, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Home from '../Home';

const Tab = createBottomTabNavigator();

export default function MainScreen() {
    const {height} = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const baseHeight =
        height < 700
            ? Platform.OS === 'android'
                ? 55
                : 70
            : Platform.OS === 'android'
                ? 65
                : 85;

    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: baseHeight + insets.bottom,
                },
                tabBarIcon: ({color, size}) => {
                    const iconProps = {color, size};

                    if (route.name === 'HomeScreen') return <HomeIcon {...iconProps} />;
                    if (route.name === 'Search') return <SearchIcon {...iconProps} />;
                    if (route.name === 'Account') return <UserIcon {...iconProps} />;
                },
            })}>
            <Tab.Screen name="HomeScreen" component={Home} />
            <Tab.Screen name="Search" component={Search} />
            <Tab.Screen name="Account" component={Account} />
        </Tab.Navigator>
    );
}
