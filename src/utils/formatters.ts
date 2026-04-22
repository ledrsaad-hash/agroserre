import { format, parseISO, isValid } from 'date-fns'
import { fr, arMA } from 'date-fns/locale'

export function formatMAD(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' MAD'
}

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(decimals === 0 ? Math.round(n) : n)
}

export function formatKg(kg: number): string {
  return formatNumber(kg, 0) + ' kg'
}

export function formatROI(roi: number | null): string {
  if (roi === null) return '—'
  return (roi >= 0 ? '+' : '') + formatNumber(roi, 1) + '%'
}

export function formatDate(dateStr: string, lang = 'fr'): string {
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    const locale = lang === 'ar' ? arMA : fr
    return format(date, 'dd MMM yyyy', { locale })
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string, lang = 'fr'): string {
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    const locale = lang === 'ar' ? arMA : fr
    return format(date, 'dd/MM/yyyy', { locale })
  } catch {
    return dateStr
  }
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
