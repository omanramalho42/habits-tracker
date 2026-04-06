"use client"

import { X } from "lucide-react"

interface CalendarDialogProps {
  isOpen: boolean
  onClose: () => void
}

// Ícones de apps
const ChatGPTIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
)

const DribbbleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.428 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/>
  </svg>
)

const NetflixIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24H5.398zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
  </svg>
)

const TestFlightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm-1.2 4.8v9.6l7.2-4.8z"/>
  </svg>
)

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

const AppleTVIcon = () => (
  <div className="text-[10px] font-semibold tracking-tight">
    <span className="text-white">tv</span>
  </div>
)

interface DayData {
  day: number
  icon?: React.ReactNode
  iconColor?: string
  hasNotification?: boolean
}

const calendarData: (DayData | null)[][] = [
  [null, null, { day: 1 }, { day: 2 }, { day: 3, icon: <ChatGPTIcon />, iconColor: "text-white" }, { day: 4 }, { day: 5 }, { day: 6 }],
  [{ day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12, icon: <DribbbleIcon />, iconColor: "text-pink-400", hasNotification: true }, { day: 13 }],
  [{ day: 14 }, { day: 15, icon: <NetflixIcon />, iconColor: "text-red-600" }, { day: 16, icon: <TestFlightIcon />, iconColor: "text-blue-400" }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20, icon: <AppleTVIcon />, iconColor: "text-white" }],
  [{ day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25, icon: <SpotifyIcon />, iconColor: "text-green-500", hasNotification: true }, { day: 26 }, { day: 27 }],
  [{ day: 28, icon: <TestFlightIcon />, iconColor: "text-white", hasNotification: true }, { day: 29 }, { day: 30 }, { day: 31 }, null, null, null],
]

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export default function CalendarDialog({ isOpen, onClose }: CalendarDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] rounded-3xl p-6 border border-[#1a1a1a]">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-[#1a1a1a] hover:bg-[#252525] rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-[#666]" />
        </button>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day, i) => (
            <div 
              key={day}
              className={`text-center text-xs font-medium py-2 rounded-full ${
                i === 2 
                  ? "bg-[#2a2a2a] text-white" 
                  : "text-[#555]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((dayData, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative ${
                    dayData ? "bg-[#161616] hover:bg-[#1e1e1e] cursor-pointer transition-colors" : ""
                  }`}
                >
                  {dayData && (
                    <>
                      {/* Icon */}
                      {dayData.icon && (
                        <div className={`mb-0.5 ${dayData.iconColor}`}>
                          {dayData.icon}
                        </div>
                      )}
                      
                      {/* Day number */}
                      <span className={`text-sm ${
                        dayData.day === 30 
                          ? "text-orange-500 font-semibold" 
                          : "text-[#888]"
                      }`}>
                        {dayData.day}
                      </span>

                      {/* Notification dot */}
                      {dayData.hasNotification && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
