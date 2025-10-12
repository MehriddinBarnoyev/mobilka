import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import Password from '../routes/screen/Password';
import MainScreen from '../routes/navigation/MainScreen';
import {useSecurity} from '../../hooks/useSecurity';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../type';
import api from '../../core/api/apiService';

const ProtectionScreen = () => {
  const [checking, setChecking] = useState(true);
  const {isSecured} = useSecurity();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await api.get('/services/userms/api/account');
        const {pinCode} = res.data;

        if (pinCode === null) {
          navigation.replace('CreatePinCodeScreen');
          return;
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
      } finally {
        setChecking(false);
      }
    };

    checkUserStatus();
  }, [navigation]);

  if (checking) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
        <Text>Checking user...</Text>
      </View>
    );
  }

  return isSecured ? <MainScreen /> : <Password />;
};

export default ProtectionScreen;
