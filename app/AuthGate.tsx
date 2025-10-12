import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';

import LoginScreen from './auth/Login';
import StackScrenn from './routes/navigation/Stack';
import auth from '../utils/auth';

const AuthGate = () => {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await auth.isLoggedIn();
        setIsLoggedIn(result);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setIsLoggedIn(false);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return isLoggedIn ? <StackScrenn /> : <LoginScreen />;
};

export default AuthGate;
