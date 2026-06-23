import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ProjectStatus = {
  type: 'completed' | 'ongoing'
  label: string
  duration?: string
}

export function getProjectStatus(
  startDate: string | null,
  endDate: string | null
): ProjectStatus | null {
  if (!startDate) return null

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  if (end) {
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())

    let duration = ''
    if (months >= 12) {
      const years = Math.floor(months / 12)
      const rem = months % 12
      duration = years > 0 ? `${years} yıl` : ''
      if (rem > 0) duration += (duration ? ' ' : '') + `${rem} ay`
    } else if (months > 0) {
      duration = `${months} ay`
    } else {
      duration = '1 aydan kısa'
    }

    return { type: 'completed', label: 'Tamamlandı', duration }
  }

  return { type: 'ongoing', label: 'Devam Ediyor' }
}

export function getProjectDuration(
  startDate: string | null,
  endDate: string | null
): string | null {
  if (!startDate) return null

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000)
  const years = Math.floor(totalDays / 365)
  const rem = totalDays % 365
  const months = Math.floor(rem / 30)
  const days = rem % 30

  const isCompleted = !!endDate
  let text = ''

  if (years > 0) text += `${years} yıl `
  if (months > 0) text += `${months} ay `

  if (isCompleted) {
    if (days > 0) text += `${days} gün `
    text += 'sürede tamamlandı'
  } else {
    if (days > 0) text += `${days} gündür `
    text += 'devam ediyor'
  }

  return text.trim()
}
