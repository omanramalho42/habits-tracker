"use client"

import { useState } from "react"

import UpdateUserSettingsDialog from '@/components/update-user-settings-dialog'

import { UserSettings } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { fetchUserSettings } from "@/services/settings"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Mail,
  MessageSquare,
  Bell,
  Settings,
  MoreHorizontal,
  LogOut
} from "lucide-react"


interface SettingsDialogProps {
  trigger: React.ReactNode
}

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const [open, setOpen] = useState<boolean>(false)

  const {
    data: userSettings,
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Configurações
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gerencia suas notificações, preferências e ajustes da conta aqui
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between space-x-4 p-4 rounded-xl bg-muted/50 border border-border/50">
        {userSettings && (
          <UpdateUserSettingsDialog
            userSettings={userSettings}
            trigger={
              <div className="flex flex-row w-full items-center justify-between space-x-3">
                <Settings className="h-5 w-5 text-primary" />
                <div className='flex flex-col w-full justify-start'>
                  <Label htmlFor="notifications" className="text-base font-semibold">
                    Ajustes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ajuste suas prefrencias e configurações aqui
                  </p>
                </div>
                <Button
                  variant="ghost"
                >
                  <MoreHorizontal />
                </Button>
              </div>
            }
          />
        )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
            >
              Fechar
            </Button>
          </DialogClose>
          {/* <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-linear-to-r from-primary to-blue-600"
          >
            {isLoading ? "Salvando..." : "Salvar mudanças"}
          </Button> */}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
