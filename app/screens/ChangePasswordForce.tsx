// import React, {useCallback, useMemo, useRef, useState} from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
//   ViewStyle,
// } from 'react-native';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {ShieldAlert, Eye, EyeOff, Lock} from 'lucide-react-native';
// import api from '../../core/api/apiService';
// import {RootStackParamList} from '../../type';
//
// type Nav = NativeStackNavigationProp<RootStackParamList>;
//
// type FormState = {
//   currentPassword: string;
//   newPassword: string;
//   confirmNewPassword: string;
// };
//
// type FormErrors = Partial<Record<keyof FormState, string>>;
//
// const MIN_LEN = 8;
//
// export default function ChangePasswordForce() {
//   const {top, bottom} = useSafeAreaInsets();
//   const navigation = useNavigation<Nav>();
//
//   const [form, setForm] = useState<FormState>({
//     currentPassword: '',
//     newPassword: '',
//     confirmNewPassword: '',
//   });
//
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [show, setShow] = useState({
//     current: false,
//     next: false,
//     confirm: false,
//   });
//
//   // NOTE: Make refs accept null in their type to match React Native's TextInput ref behavior
//   const newPassRef = useRef<TextInput | null>(null);
//   const confirmRef = useRef<TextInput | null>(null);
//
//   const setField = useCallback((key: keyof FormState, value: string) => {
//     setForm(prev => ({...prev, [key]: value}));
//     setErrors(prev => ({...prev, [key]: undefined}));
//     setApiError(null);
//   }, []);
//
//   // ---- Password strength ----
//   const strength = useMemo(() => {
//     const p = form.newPassword;
//     let score = 0;
//     if (p.length >= MIN_LEN) score++;
//     if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
//     if (/\d/.test(p)) score++;
//     if (/[^A-Za-z0-9]/.test(p)) score++;
//     return score; // 0..4
//   }, [form.newPassword]);
//
//   const strengthLabel = useMemo(() => {
//     const map = ['Juda zaif', 'Zaif', 'O‘rtacha', 'Yaxshi', 'Kuchli'];
//     return map[strength] ?? map[0];
//   }, [strength]);
//
//   const getStrengthStyle = (s: number): ViewStyle | undefined => {
//     if (s <= 0) return undefined;
//     if (s <= 2) return styles.sWeak; // 1-2
//     if (s === 3) return styles.sGood; // 3
//     return styles.sStrong; // 4
//   };
//
//   // ---- Validation ----
//     const validate = useCallback((values: FormState): FormErrors => {
//         const e: FormErrors = {};
//
//         if (!values.currentPassword) {
//             e.currentPassword = 'Joriy parolni kiriting.';
//         }
//
//         if (!values.newPassword) {
//             e.newPassword = 'Yangi parolni kiriting.';
//         } else {
//             if (values.newPassword.length < MIN_LEN) {
//                 e.newPassword = `Parol kamida ${MIN_LEN} ta belgidan iborat bo‘lishi kerak.`;
//             }
//             // faqat harf va raqamni tekshirish
//             if (!/[A-Za-z]/.test(values.newPassword) || !/\d/.test(values.newPassword)) {
//                 e.newPassword = 'Parolda kamida bitta harf va bitta raqam bo‘lishi shart.';
//             }
//         }
//
//         if (!values.confirmNewPassword) {
//             e.confirmNewPassword = 'Yangi parolni tasdiqlang.';
//         } else if (values.confirmNewPassword !== values.newPassword) {
//             e.confirmNewPassword = 'Parollar mos kelmadi.';
//         }
//
//         return e;
//     }, []);
//
//
//     const formValid = useMemo(() => {
//     const e = validate(form);
//     return Object.keys(e).length === 0;
//   }, [form, validate]);
//
//   // ---- Submit ----
//   const handleSubmit = useCallback(async () => {
//     const v = validate(form);
//     if (Object.keys(v).length > 0) {
//       setErrors(v);
//       return;
//     }
//     setSubmitting(true);
//         setApiError(null); // Clear previous errors
//
//         const payload = {
//             currentPassword: form.currentPassword.trim(),
//             newPassword: form.newPassword,
//         };
//
//         console.log('Submitting change password:', payload);
//
//         try {
//             const res = await api.post(
//                 'services/userms/api/account/change-password',
//                 payload,
//             );
//             console.log('API response:', res.data, 'status:', res.status);
//             if (res?.status === 200) {
//                 Alert.alert('Muvaffaqiyatli', 'Parolingiz yangilandi.', [
//                     { text: 'Davom etish', onPress: () => navigation.replace('Home') },
//                 ]);
//                 setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
//             } else {
//                 setApiError('Noma’lum xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
//             }
//         } catch (err: any) {
//             console.error('API error:', err?.response?.data, err?.response?.status, err?.message);
//
//             let niceMsg = "Joriy parolda xatolik bor. Tekshirib qayta urinib ko'ring";
//             const maybeMessage =
//                 err?.response?.data?.detail ||
//                 err?.response?.data?.message ||
//                 err?.response?.data?.title ||
//                 err?.response?.data?.error ||
//                 err?.message;
//
//             if (err?.code === 'ECONNABORTED') {
//                 niceMsg = 'So‘rov vaqti tugadi. Tarmoq sekin bo‘lishi mumkin.';
//             } else if (err?.response?.status === 400) {
//                 if (maybeMessage === 'error.null' || !maybeMessage) {
//                     niceMsg = 'Kiritilgan ma’lumotlar noto‘g‘ri. Joriy parol yoki yangi parolni tekshiring.';
//                 }
//             } else if (err?.response?.status === 401) {
//                 niceMsg = 'Avtorizatsiya xatosi. Iltimos, qayta tizimga kiring.';
//             } else if (err?.response?.status === 403) {
//                 niceMsg = 'Ruxsat etilmagan amal.';
//             } else if (err?.response?.status >= 500) {
//                 niceMsg = 'Serverda muammo. Birozdan so‘ng qayta urinib ko‘ring.';
//             } else if (maybeMessage) {
//                 niceMsg = String(maybeMessage);
//             }
//
//             setApiError(niceMsg);
//         } finally {
//             setSubmitting(false);
//         }
//     }, [form, navigation, validate]);
//
//   // ---- Reusable field ----
//   const renderField = (
//     label: string,
//     valueKey: keyof FormState,
//     placeholder: string,
//     isSecure: boolean,
//     showKey: 'current' | 'next' | 'confirm',
//     onSubmitEditing?: () => void,
//     returnKeyType: 'next' | 'done' = 'next',
//     inputRef?: React.RefObject<TextInput | null>, // <-- accept null
//   ) => {
//     const isError = !!errors[valueKey];
//     const showValue = show[showKey];
//
//     return (
//       <View style={styles.field}>
//         <Text style={styles.label}>{label}</Text>
//         <View
//           style={[
//             styles.inputRow,
//             isError && styles.inputRowError,
//             !!form[valueKey] && styles.inputRowFilled,
//           ]}>
//           <Lock width={18} height={18} />
//           <TextInput
//             ref={inputRef as any}
//             style={styles.input}
//             placeholder={placeholder}
//             placeholderTextColor="#9AA1A9"
//             value={form[valueKey]}
//             onChangeText={t => setField(valueKey, t)}
//             secureTextEntry={isSecure && !showValue}
//             autoCapitalize="none"
//             autoCorrect={false}
//             textContentType="password"
//             returnKeyType={returnKeyType}
//             onSubmitEditing={onSubmitEditing}
//             accessibilityLabel={label}
//           />
//           <Pressable
//             onPress={() => setShow(s => ({...s, [showKey]: !s[showKey]}))}
//             accessibilityRole="button"
//             accessibilityLabel={showValue ? 'Yashirish' : 'Ko‘rsatish'}
//             hitSlop={10}
//             style={styles.iconBtn}>
//             {showValue ? (
//               <EyeOff width={20} height={20} />
//             ) : (
//               <Eye width={20} height={20} />
//             )}
//           </Pressable>
//         </View>
//         {isError && <Text style={styles.errorText}>{errors[valueKey]}</Text>}
//       </View>
//     );
//   };
//
//   // ---- Strength Bar ----
//   const StrengthBar = () => {
//     const bars = [0, 1, 2, 3];
//     const fillStyle = getStrengthStyle(strength);
//     return (
//       <View accessible accessibilityLabel={`Parol kuchi: ${strengthLabel}`}>
//         <View style={styles.strengthWrap}>
//           {bars.map(i => (
//             <View
//               key={i}
//               style={[styles.strengthBar, i <= strength - 1 && fillStyle]}
//             />
//           ))}
//         </View>
//         {!!form.newPassword && (
//           <Text style={styles.strengthText}>{strengthLabel}</Text>
//         )}
//       </View>
//     );
//   };
//
//   return (
//     <View style={[styles.container, {paddingTop: top}]}>
//       {/* Colorful header alert */}
//       <View style={styles.alertHeader}>
//         <View style={styles.alertIconWrap}>
//           <ShieldAlert width={22} height={22} color="#fff" />
//         </View>
//         <View style={{flex: 1}}>
//           <Text style={styles.alertTitle}>
//             Xavfsizlik uchun parolingizni yangilashingiz shart.
//           </Text>
//           <Text style={styles.alertSubtitle}>
//             Kuchli parol tanlang: kamida {MIN_LEN} belgi, katta/kichik harf va
//             raqam bo‘lsin.
//           </Text>
//         </View>
//       </View>
//
//       <KeyboardAvoidingView
//         behavior={Platform.select({ios: 'padding', android: undefined})}
//         style={{flex: 1}}>
//         <ScrollView
//           contentContainerStyle={[styles.content, {paddingBottom: bottom + 24}]}
//           keyboardShouldPersistTaps="handled">
//           {renderField(
//             'Joriy parol',
//             'currentPassword',
//             'Joriy parolni kiriting',
//             true,
//             'current',
//             () => newPassRef.current?.focus(),
//             'next',
//             newPassRef,
//           )}
//
//           <View>
//             {renderField(
//               'Yangi parol',
//               'newPassword',
//               'Yangi parolni kiriting',
//               true,
//               'next',
//               () => confirmRef.current?.focus(),
//               'next',
//               newPassRef,
//             )}
//             <StrengthBar />
//           </View>
//
//           {renderField(
//             'Tasdiqlash',
//             'confirmNewPassword',
//             'Yangi parolni qayta kiriting',
//             true,
//             'confirm',
//             handleSubmit,
//             'done',
//             confirmRef,
//           )}
//
//           {apiError && (
//             <View style={styles.bannerError} accessibilityLiveRegion="polite">
//               <Text style={styles.bannerText}>{apiError}</Text>
//             </View>
//           )}
//
//           <Pressable
//             onPress={handleSubmit}
//             disabled={submitting || !formValid}
//             style={({pressed}) => [
//               styles.btn,
//               (!formValid || submitting) && styles.btnDisabled,
//               pressed && !submitting && formValid && styles.btnPressed,
//             ]}
//             accessibilityRole="button"
//             accessibilityState={{disabled: submitting || !formValid}}
//             accessibilityLabel="Parolni yangilash">
//             {submitting ? (
//               <ActivityIndicator />
//             ) : (
//               <Text style={styles.btnText}>Parolni yangilash</Text>
//             )}
//           </Pressable>
//
//           <View style={styles.tipsBox}>
//             <Text style={styles.tipTitle}>Foydali maslahatlar</Text>
//             <Text style={styles.tipItem}>
//               • Parolni turli saytlarda takrorlamang.
//             </Text>
//             <Text style={styles.tipItem}>
//               • Ism, tug‘ilgan sana, telefon raqami kabi oson taxmin qilinadigan
//               ma’lumotlardan foydalanmang.
//             </Text>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#F7F9FC'},
//
//   // Colorful, friendly header
//   alertHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 12,
//     width: '100%',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: '#EEF4FF',
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#D8E4FF',
//   },
//   alertIconWrap: {
//     marginTop: 2,
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: '#3A7AFE',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   alertTitle: {fontWeight: '700', fontSize: 16, color: '#0B1220'},
//   alertSubtitle: {marginTop: 4, color: '#3B4660', fontSize: 13, lineHeight: 18},
//
//   content: {padding: 16, gap: 16},
//
//   field: {marginBottom: 6},
//   label: {fontSize: 14, color: '#2A3441', marginBottom: 8, fontWeight: '600'},
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     borderWidth: 1,
//     borderColor: '#DCE2EA',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     height: 48,
//   },
//   inputRowFilled: {borderColor: '#C7D0DB'},
//   inputRowError: {borderColor: '#E25563'},
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: '#141A21',
//     paddingVertical: 0,
//     marginLeft: 8,
//   },
//   iconBtn: {paddingHorizontal: 6, paddingVertical: 6},
//
//   errorText: {marginTop: 6, color: '#E25563', fontSize: 12},
//
//   strengthWrap: {
//     flexDirection: 'row',
//     gap: 6,
//     marginTop: 8,
//     alignItems: 'center',
//   },
//   strengthBar: {
//     flex: 1,
//     height: 6,
//     borderRadius: 6,
//     backgroundColor: '#E9EEF5',
//   },
//   // strength color buckets (no dynamic key indexing)
//   sWeak: {backgroundColor: '#F39C12'}, // 1-2
//   sGood: {backgroundColor: '#27AE60'}, // 3
//   sStrong: {backgroundColor: '#2ECC71'}, // 4
//   strengthText: {marginTop: 6, fontSize: 12, color: '#5B6571'},
//
//   bannerError: {
//     marginTop: 8,
//     padding: 12,
//     borderRadius: 10,
//     backgroundColor: '#FDECEF',
//     borderWidth: 1,
//     borderColor: '#F5C2C7',
//   },
//   bannerText: {color: '#7D1F2A', fontSize: 13},
//
//   btn: {
//     marginTop: 12,
//     height: 48,
//     borderRadius: 12,
//     backgroundColor: '#3A7AFE',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#3A7AFE',
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     shadowOffset: {width: 0, height: 4},
//     elevation: 2,
//   },
//   btnPressed: {opacity: 0.85},
//   btnDisabled: {backgroundColor: '#A9C4FF'},
//   btnText: {color: '#FFF', fontWeight: '700', fontSize: 16},
//
//   tipsBox: {
//     marginTop: 16,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#E6E9ED',
//   },
//   tipTitle: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: '#2A3441',
//     marginBottom: 6,
//   },
//   tipItem: {fontSize: 12, color: '#5B6571', lineHeight: 18},
// });
