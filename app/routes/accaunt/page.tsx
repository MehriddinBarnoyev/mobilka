"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { LogOut, Edit3 } from "lucide-react-native"
import { useEffect, useState } from "react"
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme"
import { User, Bell, Download, HelpCircle, FileText, MonitorSmartphone } from "lucide-react-native"
import {formatUzbekDate, formatUzbekPhoneNumber} from '../../../utils/date';
import {MenuItem} from '../../components/core/MenuItem';
import {RootStackParamList} from '../../../type';
import {UserResponse} from '../../../types/shared';
import api from '../../../core/api/apiService';
import auth from '../../../utils/auth';

export default function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [data, setData] = useState<UserResponse | null>(null)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<UserResponse>("/services/userms/api/account")
        setData(res.data)
      } catch (e: any) {
        console.error("API ERROR:", e?.response?.data || e.message || e)
      }
    }

    fetchMe()
  }, [])

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Bekor qilish",
        style: "cancel",
      },
      {
        text: "Chiqish",
        style: "destructive",
        onPress: async () => {
          await auth.removeToken()
          navigation.replace("Home")
        },
      },
    ])
  }

  const handleEditProfile = () => {
    navigation.navigate("EditProfile")
  }

  const handleDevicesSettings = () => {
    navigation.navigate("DevicesScreen", { fromAccount: true })
  }

  const handleDownloads = () => {
    navigation.navigate("MyDownloads")
  }

  const handlePrivacy = () => {
    navigation.navigate("Offerta")
  }

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
              uri: "https://cdn-icons-png.flaticon.com/512/12225/12225881.png",
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={handleEditProfile} activeOpacity={0.8}>
            <Edit3 size={16} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {data?.firstName} {data?.lastName}
          </Text>
          <Text style={styles.userEmail}>{data && formatUzbekPhoneNumber(data?.phoneNumber)}</Text>
          <Text style={styles.memberSince}>A'zo bo'lgan sana: {data && formatUzbekDate(data?.createdDate)}</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.menuContainer}>
          <MenuItem title="Yuklab olinganlar" onPress={handleDownloads} icon={Download} status={true} />
          <MenuItem title="Profil sozlamalari" onPress={handleEditProfile} icon={User} status={true} />
          <MenuItem title="Aktiv seanslar" onPress={handleDevicesSettings} icon={MonitorSmartphone} status={true} />
          <MenuItem title="Xabarnomalar" onPress={() => {}} icon={Bell} status={false} />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuContainer}>
          <MenuItem title="Qo'llab quvvatlash" onPress={() => {}} icon={HelpCircle} status={false} />
          <MenuItem title="Offerta shartlari" onPress={handlePrivacy} icon={FileText} status={false} />
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <View style={styles.menuContainer}>
          <MenuItem title="Tizimdan chiqish" onPress={handleLogout} icon={LogOut} isDestructive={true} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 2.1.4</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  header: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  profileSection: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: SPACING.xl,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "#F5F5F5",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.text.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.md,
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  section: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    letterSpacing: -0.2,
  },
  menuContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
})
