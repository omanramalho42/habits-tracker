import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone } from "date-fns-tz"
import { MetricType } from '@prisma/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSafeDate(dateStr?: string | null) {
  if (!dateStr) return null

  const [year, month, day] = dateStr.split('-').map(Number)

  if (!year || !month || !day) {
    throw new Error(`Invalid date format: ${dateStr}`)
  }

  // meio-dia local (anti-timezone bug)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export const formatTimezone = (date: string) => {
  const formatDate = new Date(date)

  const brDate = formatInTimeZone(
    formatDate,
    "America/Sao_Paulo",
    "dd/MM/yyyy HH:mm"
  )

  return brDate
}

export const formatDateBR = (date: Date) => {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const day = parts.find(p => p.type === "day")?.value
  const month = parts.find(p => p.type === "month")?.value
  const year = parts.find(p => p.type === "year")?.value

  return `${year}-${month}-${day}`
}

export function getTodayDay() {
  const now = new Date()

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
}

export const uploadFile = async (file: File) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "my_unsigned_preset"); // Nome do preset criado no Cloudinary

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dxx3qxsxt/auto/upload`, // sem espaço
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    console.log("Upload success:", result);
    return result;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const mapType = (type?: string): MetricType => {
  switch (type) {
    case "currency":
      return "FLOAT"
    case "weight":
      return "FLOAT"
    case "distance":
      return "FLOAT"
    case "liquid":
      return "FLOAT"
    default:
      return "NUMERIC"
  }
}

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => T = ((index) => index as T)
): T[] {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(`Invalid range length: ${length}`)
  }
  return Array.from({ length }, (_, index) => initializer(index))
}
