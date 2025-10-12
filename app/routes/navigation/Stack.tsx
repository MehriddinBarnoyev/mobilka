/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../type';
import ProtectionScreen from '../../screens/ProtectionScreen';
import VideoScreen from '../../screens/VideoScreen';
import EditProfile from '../../screens/EditProfile';
import Offerta from '../../screens/Offerta';
import HomeGroup from '../screen/GroupsScreen';
import MyDownloadsScreen from '../../screens/MyDownloadsScreen';
import SearchedVideos from '../../screens/SearchedVideos';
import CreatePinCode from '../../screens/CreatePinCode';
import ChangePasswordForce from '../../screens/ChangePasswordForce';
import DevicesScreen from '../../screens/DevicesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackScreen() {
  return (
    <Stack.Navigator initialRouteName="Protection">
      <Stack.Screen
        name="Protection"
        component={ProtectionScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VideoScreen"
        component={VideoScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Offerta"
        component={Offerta}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="HomeGroup"
        component={HomeGroup}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MyDownloads"
        component={MyDownloadsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SearchedVideos"
        component={SearchedVideos}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreatePinCodeScreen"
        component={CreatePinCode}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChangePasswordForce"
        component={ChangePasswordForce}
        options={{headerShown: false}}
      />
      
    </Stack.Navigator>
  );
}
