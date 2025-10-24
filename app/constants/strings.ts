// Centralized localization strings (Uzbek)
export const STRINGS = {
  // Common
  loading: "Yuklanmoqda…",
  error: "Xatolik",
  success: "Muvaffaqiyatli",
  cancel: "Bekor qilish",
  continue: "Davom etish",
  retry: "Qayta urinish",
  delete: "O'chirish",

  // Password
  currentPassword: "Joriy parol",
  newPassword: "Yangi parol",
  confirmPassword: "Tasdiqlash",
  enterCurrentPassword: "Joriy parolni kiriting",
  enterNewPassword: "Yangi parolni kiriting",
  confirmNewPassword: "Yangi parolni qayta kiriting",
  passwordUpdated: "Parolingiz yangilandi.",
  updatePassword: "Parolni yangilash",

  // Password strength
  strengthVeryWeak: "Juda zaif",
  strengthWeak: "Zaif",
  strengthMedium: "O'rtacha",
  strengthGood: "Yaxshi",
  strengthStrong: "Kuchli",

  // Validation errors
  requiredField: "Bu maydon to'ldirilishi shart.",
  passwordTooShort: (min: number) => `Parol kamida ${min} ta belgidan iborat bo\'lishi kerak.`,
  passwordRequirements: "Parolda kamida bitta harf va bitta raqam bo'lishi shart.",
  passwordMismatch: "Parollar mos kelmadi.",
  pinInvalid: "PIN faqat 6 ta raqamdan iborat bo'lishi kerak.",

  // Security
  securityAlert: "Xavfsizlik uchun parolingizni yangilashingiz shart.",
  securityTip: (min: number) => `Kuchli parol tanlang: kamida ${min} belgi, katta/kichik harf va raqam bo\'lsin.`,
  tips: "Foydali maslahatlar",
  tipDontReuse: "• Parolni turli saytlarda takrorlamang.",
  tipAvoidPersonal: "• Ism, tug'ilgan sana, telefon raqami kabi oson taxmin qilinadigan ma'lumotlardan foydalanmang.",

  // Devices
  activeDevices: "Faol qurilmalar",
  deviceAllowed: "Ruxsat berilgan",
  deviceNotAllowed: "Ruxsat berilmagan — qurilmalar ko'p",
  deviceCheckError: "Qurilmalarni tekshirishda xatolik",
  removeDevice: "Qurilmani o'chirish",
  removeDeviceConfirm: "Ushbu qurilmani faol seanslardan olib tashlamoqchimisiz?",
  maxDevicesReached:
    "Maksimal qurilmalar soniga yetdingiz. Davom etish uchun pastdan kamida bitta qurilmani o'chiring va qayta tekshiring.",
  noDevicesFound: "Seans topilmadi",
  noDevicesText: "Faol qurilmalar ro'yxati bo'sh.",

  // PIN
  createPin: "Yangi PIN kod",
  createPinFor: (firstName: string, lastName: string) => `Yangi PIN kod ${firstName} ${lastName} uchun`,
  createPinSubtitle: (length: number) => `Iltimos, yangi ${length} xonali xavfsizlik kodini yarating`,
  pinSaved: "PIN kod muvaffaqiyatli saqlandi",
  pinSaveError: "PINni saqlab bo'lmadi. Qayta urinib ko'ring.",
  userDataError: "Foydalanuvchi ma'lumotlarini yuklashda xatolik.",
  userDataNotReady: "Foydalanuvchi ma'lumotlari hali tayyor emas.",
} as const
