export const isNotExpired = (expirationDate: string, currentDate: Date = new Date()): boolean => {
  const expDate = new Date(expirationDate)
  return expDate >= currentDate
}

export const formatExpirationDate = (expirationDate: string): string => {
  return new Date(expirationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatUzbekDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatUzbekPhoneNumber = (phoneNumber: string): string => {
  // Format: +998 (XX) XXX-XX-XX
  if (!phoneNumber) return ""
  const cleaned = phoneNumber.replace(/\D/g, "")
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`
  }
  return phoneNumber
}
