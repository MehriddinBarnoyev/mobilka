// Validation utilities
export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const MIN_PASSWORD_LENGTH = 8
export const PIN_LENGTH = 6

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Parolni kiriting." }
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `Parol kamida ${MIN_PASSWORD_LENGTH} ta belgidan iborat bo'lishi kerak.`,
    }
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      isValid: false,
      error: "Parolda kamida bitta harf va bitta raqam bo'lishi shart.",
    }
  }

  return { isValid: true }
}

export function validatePasswordMatch(password: string, confirm: string): ValidationResult {
  if (!confirm) {
    return { isValid: false, error: "Yangi parolni tasdiqlang." }
  }

  if (password !== confirm) {
    return { isValid: false, error: "Parollar mos kelmadi." }
  }

  return { isValid: true }
}

export function validatePin(pin: string): ValidationResult {
  if (pin.length !== PIN_LENGTH || !/^\d+$/.test(pin)) {
    return { isValid: false, error: "PIN faqat 6 ta raqamdan iborat bo'lishi kerak." }
  }

  return { isValid: true }
}

export function calculatePasswordStrength(password: string): {
  score: number
  label: string
} {
  let score = 0

  if (password.length >= MIN_PASSWORD_LENGTH) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ["Juda zaif", "Zaif", "O'rtacha", "Yaxshi", "Kuchli"]

  return {
    score,
    label: labels[score] ?? labels[0],
  }
}
