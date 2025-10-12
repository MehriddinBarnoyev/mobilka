// Optimized version of the EditProfile component with logic simplification,
// type safety improvements, and better structure without UI change

'use client';

import {useState, useRef, useEffect, JSX} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  ChevronLeft,
  Phone,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../type';
import api from '../../core/api/apiService';
import Soon from '../components/soon/soon';

const {width} = Dimensions.get('window');

interface FormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors extends Partial<FormData> {}

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  error?: string;
  icon: any;
  rightIcon?: JSX.Element;
  onRightIconPress?: () => void;
};

export default function EditProfile() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileImage, setProfileImage] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  );
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/services/userms/api/account');
        const user = res.data;
        setFormData(prev => ({
          ...prev,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email || '',
          phone: user.phoneNumber || '',
        }));
      } catch (e: any) {
        console.error('Failed to fetch user info:', e);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    setHasChanges(true);
    if (errors[field]) setErrors(prev => ({...prev, [field]: undefined}));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Invalid email address';

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword)
        newErrors.currentPassword = 'Current password is required';
      if (formData.newPassword.length < 8)
        newErrors.newPassword = 'Password must be at least 8 characters';
      if (formData.newPassword !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Profile updated successfully.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
      setHasChanges(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      {text: 'Camera', onPress: () => {}},
      {text: 'Photo Library', onPress: () => {}},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    error,
    icon: Icon,
    rightIcon,
    onRightIconPress,
  }: InputFieldProps) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Icon
          size={20}
          color="#666"
          strokeWidth={1.5}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#DC3545" strokeWidth={1.5} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil sozlamalari</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={{uri: profileImage}} style={styles.profileImage} />
          </View>
          <Text
            style={[
              styles.profileImageText,
              {fontWeight: 'bold', fontSize: 18},
            ]}>
            {formData.name || 'No Name Set'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shahsiy ma'lumotlar</Text>
          <InputField
            label="Ismingiz va familiyangiz"
            value={formData.name}
            onChangeText={value => handleInputChange('name', value)}
            placeholder="Enter your full name"
            error={errors.name}
            icon={User}
          />
          <InputField
            label="Email manzili"
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
            icon={Mail}
          />
          <InputField
            label="Telefon raqami"
            value={formData.phone}
            onChangeText={value => handleInputChange('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            icon={Phone}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parolni o'zgartirish</Text>
          <Text style={styles.sectionSubtitle}>
            Hozirgi parolni qoldirish uchun bu qisimni bo'sh qoldiring.
          </Text>
          <Soon />

          <InputField
            label="Hozirgi parol"
            value={formData.currentPassword}
            onChangeText={value => handleInputChange('currentPassword', value)}
            placeholder="Havfsizlik paroli"
            secureTextEntry={!showPassword.current}
            error={errors.currentPassword}
            icon={Lock}
            rightIcon={
              showPassword.current ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )
            }
            onRightIconPress={() =>
              setShowPassword(prev => ({...prev, current: !prev.current}))
            }
          />

          <InputField
            label="Yangi parol"
            value={formData.newPassword}
            onChangeText={value => handleInputChange('newPassword', value)}
            placeholder="Yangi havfsizlik paroli"
            secureTextEntry={!showPassword.new}
            error={errors.newPassword}
            icon={Lock}
            rightIcon={
              showPassword.new ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )
            }
            onRightIconPress={() =>
              setShowPassword(prev => ({...prev, new: !prev.new}))
            }
          />

          <InputField
            label="Yangi parolni tasdiqlang"
            value={formData.confirmPassword}
            onChangeText={value => handleInputChange('confirmPassword', value)}
            placeholder="Yangi havfsizlik parolini tasdiqlang"
            secureTextEntry={!showPassword.confirm}
            error={errors.confirmPassword}
            icon={Lock}
            rightIcon={
              showPassword.confirm ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )
            }
            onRightIconPress={() =>
              setShowPassword(prev => ({...prev, confirm: !prev.confirm}))
            }
          />
        </View>

        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Save size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>
                  O'zgarishlarni saqlash
                </Text>
              </View>
            )}

            <Soon />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImageText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: '#DC3545',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    height: '100%',
  },
  rightIconButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#DC3545',
    marginLeft: 6,
  },
  socialContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  socialItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  socialInfo: {
    flex: 1,
  },
  socialPlatform: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  socialUsername: {
    fontSize: 14,
    color: '#666666',
  },
  socialToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  socialToggleConnected: {
    backgroundColor: '#1A1A1A',
  },
  socialToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  socialToggleTextConnected: {
    color: '#FFFFFF',
  },
  saveSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
