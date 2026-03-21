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
  CheckCircle,
  ChartArea,
  LucideNewspaper,
  Settings,
  LogOut
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
import { SignOutButton } from "@clerk/nextjs"

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
          href="#routines"
          active={pathname.startsWith("#routines")}
        />

        {/* CENTER BUTTON */}
        <div className="relative -mt-10">
          <div className="absolute inset-0 bg-green-500 blur-2xl opacity-50 rounded-full scale-125" />

          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="relative z-10 w-16 h-16 rounded-full bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.9)] ring-2 ring-green-400/40 hover:scale-105 transition"
                >
                  <Plus className="w-7 h-7" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                {/* -------- NAV -------- */}
                <DropdownMenuLabel>Navegação</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/statistics" className="flex items-center gap-2">
                    <ChartArea className="h-4 w-4" />
                    Estatísticas
                  </Link>
                </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link href="/habits" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Hábitos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/news" className="flex items-center gap-2">
                    <LucideNewspaper className="h-4 w-4" />
                    Novidades
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* -------- CREATE -------- */}
                <DropdownMenuLabel>Criar</DropdownMenuLabel>

                <CreateHabitDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <Target className="h-4 w-4" />
                      Hábito
                    </DropdownMenuItem>
                  }
                />

                <CreateRoutineDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <Repeat className="h-4 w-4" />
                      Rotina
                    </DropdownMenuItem>
                  }
                />

                <CreateTaskDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <ListTodo className="h-4 w-4" />
                      Tarefa
                    </DropdownMenuItem>
                  }
                />

                <CreateCategorieDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <Tag className="h-4 w-4" />
                      Categoria
                    </DropdownMenuItem>
                  }
                />

                <CreateGoalDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <Target className="h-4 w-4" />
                      Objetivo
                    </DropdownMenuItem>
                  }
                />

                <CreateCheckPointDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Checkpoint
                    </DropdownMenuItem>
                  }
                />

                <DropdownMenuSeparator />

                {/* -------- LOGOUT -------- */}
                <DropdownMenuItem asChild>
                  <SignOutButton>
                    <button className="flex items-center gap-2 w-full text-red-500">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </SignOutButton>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
          href="/settings"
          active={pathname.startsWith("/settings")}
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