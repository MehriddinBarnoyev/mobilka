import type { AxiosError } from "axios"

export interface ApiErrorResponse {
  detail?: string
  message?: string
  title?: string
  error?: string
}

export function parseApiError(error: unknown): string {
  if (!error) return "Noma'lum xatolik yuz berdi."

  const err = error as AxiosError<ApiErrorResponse>

  // Timeout
  if (err.code === "ECONNABORTED") {
    return "So'rov vaqti tugadi. Tarmoq sekin bo'lishi mumkin."
  }

  // HTTP status codes
  const status = err.response?.status
  const data = err.response?.data

  if (status === 400) {
    const msg = data?.detail || data?.message || data?.title || data?.error
    if (!msg || msg === "error.null") {
      return "Kiritilgan ma'lumotlar noto'g'ri."
    }
    return String(msg)
  }

  if (status === 401) {
    return "Avtorizatsiya xatosi. Iltimos, qayta tizimga kiring."
  }

  if (status === 403) {
    return "Ruxsat etilmagan amal."
  }

  if (status && status >= 500) {
    return "Serverda muammo. Birozdan so'ng qayta urinib ko'ring."
  }

  // Fallback to any message in response
  const maybeMessage = data?.detail || data?.message || data?.title || data?.error
  if (maybeMessage) {
    return String(maybeMessage)
  }

  return "Noma'lum xatolik yuz berdi."
}

  export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })
  } catch {
    return iso
  }
}
