import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../type';
import {
  User,
  Bell,
  Download,
  HelpCircle,
  FileText,
  LogOut,
  Edit3,
  ChevronRight,
  MonitorSmartphone,
} from 'lucide-react-native';
import auth from '../../utils/auth';
import {useEffect, useState} from 'react';
import api from '../../core/api/apiService';
import {formatUzbekDate, formatUzbekPhoneNumber} from '../../utils/func';
import Soon from '../components/soon/soon';

type User = {
  createdBy: string;
  createdDate: string; // ISO date string
  lastModifiedBy: string;
  lastModifiedDate: string; // ISO date string
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  designedName: string;
  imageUrl: string | null;
  activated: boolean;
  langKey: string;
  authorities: string[]; // You can use a union if values are fixed, e.g., ('VIEWER' | 'ADMIN')[]
};

export default function Account() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [data, setData] = useState<User>();
  const fetchMe = async () => {
    try {
      const res = await api.get('/services/userms/api/account');
      setData(res.data);
      // console.log(res.data, 'api data');
    } catch (e: any) {
      console.error('API ERROR:', e?.response?.data || e.message || e);
    }
  };



  useEffect(() => {
    console.log('Start API call...');
    fetchMe();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Bekor qilish',
        style: 'cancel',
      },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: async () => {
          // Handle logout logic here
          await auth.removeToken();
          console.log('User logged out');
          navigation.replace('Home');
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Navigate to edit profile');
    navigation.navigate('EditProfile');
  };

  const handleNotificationSettings = () => {
    // Navigate to notification settings
    console.log('Navigate to notification settings');
  };

  const handleDevicesSettings = () => {
    // Navigate to devices settings
    console.log('Navigate to devices settings');
    navigation.navigate('DevicesScreen', { fromAccount: true });
  };

  const handleDownloads = () => {
    // Navigate to downloads screen
    console.log('Navigate to downloads');
    navigation.navigate('MyDownloads');
  };

  const handleSupport = () => {
    // Navigate to support
    console.log('Navigate to support');
  };

  const handlePrivacy = () => {
    // Navigate to privacy
    console.log('Navigate to privacy');
    navigation.navigate('Offerta');
  };

  const MenuItem = ({
    title,
    onPress,
    icon: Icon,
    isDestructive = false,
    status,
  }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={status === 'disabled'}>
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            isDestructive && styles.destructiveIconContainer,
          ]}>
          <Icon
            size={20}
            color={isDestructive ? '#DC3545' : '#666666'}
            strokeWidth={1.5}
          />
        </View>
        <Text
          style={[styles.menuText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>

      <ChevronRight size={20} color="#CCCCCC" strokeWidth={1.5} />

      {/* Overlay on top of the entire menu item */}
      {status === false && <Soon />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/12225/12225881.png',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}>
            <Edit3 size={16} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {data?.firstName} {data?.lastName}
          </Text>
          <Text style={styles.userEmail}>
            {data && formatUzbekPhoneNumber(data?.phoneNumber)}
          </Text>
          <Text style={styles.memberSince}>
            A'zo bo'lgan sana: {data && formatUzbekDate(data?.createdDate)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.menuContainer}>
          <MenuItem
            status={true}
            title="Yuklab olinganlar"
            onPress={handleDownloads}
            icon={Download}
          />
          <MenuItem
            status={true}
            title="Profil sozlamalari"
            onPress={handleEditProfile}
            icon={User}
          />
          <MenuItem
            status={true}
            title="Aktiv seanslar"
            onPress={handleDevicesSettings}
            icon={MonitorSmartphone}
          />
          <MenuItem
            status={false}
            title="Xabarnomalar"
            onPress={handleNotificationSettings}
            icon={Bell}
          />
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuContainer}>
          <MenuItem
            status={false}
            title="Qo'llab quvvatlash"
            onPress={handleSupport}
            icon={HelpCircle}
          />

          <MenuItem
            status={false}
            title="Offerta shartlari"
            onPress={handlePrivacy}
            icon={FileText}
          />
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <View style={styles.menuContainer}>
          <MenuItem
            title="Tizimdan chiqish"
            onPress={handleLogout}
            icon={LogOut}
            isDestructive={true}
          />
        </View>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 2.1.4</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#888888',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  menuContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: '#FFF5F5',
  },
  menuText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  destructiveText: {
    color: '#DC3545',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    borderRadius: 0,
  },
  soonBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});