import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../../type';
import Icon from 'react-native-vector-icons/Feather';
import { InputField } from './components/InputField';
import { CustomButton } from './components/CustomButton';
import api from '../../core/api/apiService';
import auth from '../../utils/auth';
import {useUser} from "../../context/UserContext";

export default function LoginScreen() {

    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>(
        {},
    );
    const {setUser: setUser} = useUser()
    const validate = () => {
        const usernameErr = !username ? 'Username is required' : undefined;
        const passErr = !password
            ? 'Password is required'
            : password.length < 3
                ? 'At least 3 characters'
                : undefined;
        setErrors({ username: usernameErr, password: passErr });
        return !(usernameErr || passErr);
    };

    const otpUrl = 'services/userms/api/authenticate/otp';

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await api.post(otpUrl, {
                username,
                password,
            });

            const token = res.data?.jwtToken;
            console.log(token, 'token')

            if (token && token.trim().length > 0) {
                await auth.setToken(token);
                const userRes = await api.get("services/userms/api/account");
                const user = userRes.data;
                setUser(user);
                navigation.navigate('DevicesScreen');
            } else {
                navigation.navigate('Otp', {
                    username,
                    password,
                    response: res.data,
                });
            }

            setUsername('');
            setPassword('');
        } catch (e: any) {
            Alert.alert(
                'Login failed',
                `${e?.message || 'Unknown error'}, Invalid username or password (${username}-${password}) => ${otpUrl}`,
            );
            console.error('Login error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled">
            <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
            <View style={styles.logoBox}>
                <Icon name="activity" size={32} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <InputField
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                iconName="user"
                error={errors.username}
            />

            <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                iconName="lock"
                error={errors.password}
                showPasswordToggle
                onTogglePassword={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
            />

            {/*<TouchableOpacity onPress={() => Alert.alert('Reset link sent')}>*/}
            {/*    <Text style={styles.forgot}>Forgot Password ?</Text>*/}
            {/*</TouchableOpacity>*/}

            <CustomButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                icon="log-in"
            />
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: '#F0F9FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        color: '#6B7280',
        marginBottom: 32,
    },
    forgot: {
        color: '#3B82F6',
        fontWeight: '500',
        textAlign: 'right',
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    signUp: {
        color: '#3B82F6',
        fontWeight: '600',
    },
});