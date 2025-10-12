export function formatUzbekPhoneNumber(phone: any): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle cases where phone is given with or without country code
  const normalized = digits.startsWith('998') ? digits.slice(3) : digits;

  if (normalized.length !== 9) {
    return phone; // Invalid length
  }

  const operatorCode = normalized.slice(0, 2);
  const part1 = normalized.slice(2, 5);
  const part2 = normalized.slice(5, 7);
  const part3 = normalized.slice(7, 9);

  return `+998 (${operatorCode}) ${part1}-${part2}-${part3}`;
}

export function formatUzbekDate(isoDate: any): string {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) return isoDate;

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}.${mm}.${yyyy} `;
}
