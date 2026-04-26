import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"
import { MetricType } from '@prisma/client'

import { toZonedTime, format } from "date-fns-tz"
import { CategoryType, UNIT_TO_CATEGORY } from './constants/field-types'

const BRAZIL_TZ = "America/Sao_Paulo"

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


export function getBrazilDayRangeUTC(date: Date | string) {
  let localDate: Date

  if (typeof date === "string" && date.length === 10) {
    const [y, m, d] = date.split("-").map(Number)
    localDate = new Date(y, m - 1, d) // 👈 LOCAL (Brasil)
  } else {
    const parsed = new Date(date)
    localDate = new Date(
      parsed.toLocaleString("en-US", { timeZone: BRAZIL_TZ })
    )
  }

  const start = new Date(localDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(localDate)
  end.setHours(23, 59, 59, 999)

  return {
    startUTC: fromZonedTime(start, BRAZIL_TZ),
    endUTC: fromZonedTime(end, BRAZIL_TZ),
  }
}
export function toBrazilStartOfDayUTC(date: Date | string) {
  const parsed = new Date(date)

  // 🔥 cria uma data "local" baseada no Brasil
  const brDate = new Date(
    parsed.toLocaleString("en-US", { timeZone: BRAZIL_TZ })
  )

  brDate.setHours(0, 0, 0, 0)

  // 🔥 converte de volta pra UTC
  return fromZonedTime(brDate, BRAZIL_TZ)
}
export function formatToBrazilDay(date: Date | string) {
  const zoned = toZonedTime(new Date(date), BRAZIL_TZ)
  zoned.setHours(0,0,0,0) //COMECO DO DIA
  return format(zoned, "yyyy-MM-dd", { timeZone: BRAZIL_TZ })
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

export function urlB64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
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

const DEBUG = true

export function log(step: string, data?: any) {
  if (!DEBUG) return

  console.log(`\n🧩 [TASK TOGGLE] → ${step}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

export const getCategoryFromData = (unit?: string, fieldType?: MetricType): CategoryType => {
  // 1. Se tem unidade, prioriza o mapa
  if (unit && UNIT_TO_CATEGORY[unit]) {
    return UNIT_TO_CATEGORY[unit];
  }
  
  // 2. Se não tem unidade, tenta inferir pelo MetricType
  if (fieldType === "FLOAT") return "numeric"; // Ou outro padrão que desejar
  
  return "numeric";
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
