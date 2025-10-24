"use client"

import { useState, useCallback, useMemo } from "react"
import { validatePassword, validatePasswordMatch, calculatePasswordStrength } from "../utils/validation"

interface PasswordFormState {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

interface PasswordFormErrors {
  currentPassword?: string
  newPassword?: string
  confirmNewPassword?: string
}

export function usePasswordForm() {
  const [form, setForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const [errors, setErrors] = useState<PasswordFormErrors>({})

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const setField = useCallback((key: keyof PasswordFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const toggleShow = useCallback((key: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const strength = useMemo(() => calculatePasswordStrength(form.newPassword), [form.newPassword])

  const validate = useCallback((): boolean => {
    const newErrors: PasswordFormErrors = {}

    if (!form.currentPassword) {
      newErrors.currentPassword = "Joriy parolni kiriting."
    }

    const passwordValidation = validatePassword(form.newPassword)
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.error
    }

    const matchValidation = validatePasswordMatch(form.newPassword, form.confirmNewPassword)
    if (!matchValidation.isValid) {
      newErrors.confirmNewPassword = matchValidation.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const isValid = useMemo(() => {
    return (
      !!form.currentPassword &&
      !!form.newPassword &&
      !!form.confirmNewPassword &&
      validatePassword(form.newPassword).isValid &&
      validatePasswordMatch(form.newPassword, form.confirmNewPassword).isValid
    )
  }, [form])

  const reset = useCallback(() => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    })
    setErrors({})
  }, [])

  return {
    form,
    errors,
    showPasswords,
    strength,
    isValid,
    setField,
    toggleShow,
    validate,
    reset,
  }
}
