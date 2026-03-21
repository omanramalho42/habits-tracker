"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  CalendarPlus,
  RefreshCcw,
  User,
  Plus,
  Target,
  Repeat,
  ListTodo,
  Tag,
  CheckCircle
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

// 🔥 dialogs (mesmos do header)
import { CreateHabitDialog } from "@/components/create-habit-dialog"
import CreateRoutineDialog from "@/components/create-routine-dialog"
import CreateTaskDialog from "@/components/tasks/create-task-dialog"
import CreateCategorieDialog from "@/components/categories/create-categorie-dialog"
import CreateGoalDialog from "@/components/goals/create-goal-dialog"
import CreateCheckPointDialog from "@/components/create-checkpoint-dialog"
export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4">

      <div className="relative w-full max-w-md mx-4 px-4 py-3 rounded-2xl 
        bg-black/70 backdrop-blur-xl 
        border border-white/10 
        shadow-[0_0_30px_rgba(34,197,94,0.15)]
        flex items-center justify-between"
      >

        <NavItem
          icon={Home}
          label="Início"
          href="/"
          active={pathname === "/"}
        />

        <NavItem
          icon={CalendarPlus}
          label="Rotinas"
          href="/routines"
          active={pathname.startsWith("/routines")}
        />

        {/* CENTER BUTTON */}
        <div className="relative -mt-10">
          <div className="absolute inset-0 bg-green-500 blur-2xl opacity-50 rounded-full scale-125" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="relative z-10 w-16 h-16 rounded-full bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.9)] ring-2 ring-green-400/40 hover:scale-105 transition"
              >
                <Plus className="w-7 h-7" />
              </Button>
            </DropdownMenuTrigger>

            {/* ...menu continua igual */}
          </DropdownMenu>
        </div>

        <NavItem
          icon={RefreshCcw}
          label="Hábitos"
          href="/habits"
          active={pathname.startsWith("/habits")}
        />

        <NavItem
          icon={User}
          label="Perfil"
          href="/profile"
          active={pathname.startsWith("/profile")}
        />

      </div>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  href
}: {
  icon: any
  label: string
  active?: boolean
  href?: string
}) {
  return (
    <Link href={href || "#"}>
      <div className="flex flex-col items-center gap-1 cursor-pointer">
        <div
          className={cn(
            "p-2 rounded-xl transition",
            active
              ? "bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
              : "text-muted-foreground"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span
          className={cn(
            "text-xs",
            active ? "text-green-400" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}