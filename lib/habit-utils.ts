export const WEEKDAY_MAP: { [key: string]: number } = {
  S: 0, // Sunday
  M: 1, // Monday
  T: 2, // Tuesday
  W: 3, // Wednesday
  TH: 4, // Thursday
  F: 5, // Friday
  SA: 6, // Saturday
}

export const WEEKDAYS = [
  { key: "S", keyPtBr: "D", label: "S", name: "Domingo" },
  { key: "M", keyPtBr: "S", label: "M", name: "Segunda" },
  { key: "T", keyPtBr: "T", label: "T", name: "Terça" },
  { key: "W", keyPtBr: "Q", label: "W", name: "Quarta" },
  { key: "TH", keyPtBr: "Q", label: "TH", name: "Quinta" },
  { key: "F", keyPtBr: "S", label: "F", name: "Sexta" },
  { key: "SA", keyPtBr: "S", label: "SA", name: "Sábado" },
]

export function calculateStreak(completions: { completedDate: string }[]): {
  currentStreak: number
  longestStreak: number
} {
  if (!completions.length) return { currentStreak: 0, longestStreak: 0 }

  const sortedDates = completions.map((c) => new Date(c.completedDate)).sort((a, b) => b.getTime() - a.getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check current streak
  const lastCompletion = sortedDates[0]
  lastCompletion.setHours(0, 0, 0, 0)

  if (lastCompletion.getTime() === today.getTime() || lastCompletion.getTime() === yesterday.getTime()) {
    currentStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i])
      current.setHours(0, 0, 0, 0)
      const previous = new Date(sortedDates[i - 1])
      previous.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i])
    current.setHours(0, 0, 0, 0)
    const previous = new Date(sortedDates[i - 1])
    previous.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, 1)

  return { currentStreak, longestStreak }
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getTodayString(): string {
  return formatDate(new Date())
}

export function normalizeDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isHabitActiveOnDate(
  habit: {
    startDate: string
    endDate: string | null
    frequency: string[]
  },
  date: Date
): boolean {
  console.log(date, 'date', habit, 'habit')
  const currentDate = normalizeDateOnly(date)
  const habitStartDate = normalizeDateOnly(new Date(habit.startDate))
  const habitEndDate = habit.endDate
  ? normalizeDateOnly(new Date(habit.endDate))
  : null

  // console.log(currentDate, habitStartDate, habitEndDate, "current | start | end -> date (!!)")

  // ⛔ antes do início
  if (currentDate < habitStartDate) {
    return false
  }

  // ⛔ depois do fim (se existir)
  if (habitEndDate && currentDate > habitEndDate) {
    return false
  }

  // 📅 valida frequência
  const dayOfWeek = currentDate.getDay()

  return habit.frequency.some(
    key => WEEKDAY_MAP[key] === dayOfWeek
  )
}

