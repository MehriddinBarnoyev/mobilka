import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import NativeControlsScreen from './vdocipher/NativeControlsScreen';
import JSControlsScreen from './vdocipher/JSControlsScreen';
import DownloadsScreen from './vdocipher/DownloadsScreen';
import {enableScreens} from 'react-native-screens';
import {RootStackParamList} from '../type';
import PlaylistScreen from './vdocipher/PlaylistScreen';

import AuthGate from './AuthGate';
import Otp from './auth/otp/Otp';
import DevicesScreen from './screens/DevicesScreen';
import LoginScreen from './auth/Login';
import {navigationRef} from '../core/navigationService';
import {GroupDetail} from './screens/gropDetail';
import PlaylistDetail from './screens/playlistDetail';
import VideoScreen from './screens/VideoScreen';
import {NetworkProvider} from '../hooks/NetworkProvider';
import {UserProvider} from '../context/UserContext';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <UserProvider>
      <NetworkProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={AuthGate}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="NativeControls"
              component={NativeControlsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="JSControls"
              component={JSControlsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Downloads"
              component={DownloadsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Playlist"
              component={PlaylistScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Otp"
              component={Otp}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="DevicesScreen"
              component={DevicesScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            {/* Added screens for navigation */}
            <Stack.Screen
              name="GroupDetail"
              component={GroupDetail}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PlaylistDetail"
              component={PlaylistDetail}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="VideoScreen"
              component={VideoScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NetworkProvider>
    </UserProvider>
  );
}
