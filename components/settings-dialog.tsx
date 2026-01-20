"use client"

import { SignedOut, SignOutButton, UserProfile } from '@clerk/nextjs'

import { useEffect, useState } from "react"

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
import axios from 'axios'
import { toast } from 'sonner'

interface SettingsDialogProps {
  trigger: React.ReactNode
}

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [settings, setSettings] = useState({
    notifications_enabled: false,
    email_notifications: false,
    sms_notifications: false,
    email: "",
    phone: "",
  })

  const [showSettingsUser, setShowSettingsUser] = useState(false);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [open])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const toastId =
      toast.loading("Salvando ajustes...", {
        id: 'update-settings'
      })

    try {
      const response =
        await axios.patch(
          "/api/settings",
          settings
        )

      if (response.data) {
        toast.success(
          "Suas preferencias de notificações foram atualizadas.",
          { id: toastId }
        )

        setOpen((prev) => !prev)
      }
    } catch (error) {
      toast.error(
        "Falha ao salvar preferencias, tente novamente.",
        { id: toastId }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Configurações
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gerencia suas notificações, preferências e ajustes da conta aqui
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="notifications" className="text-base font-semibold">
                  Ativar Notificações
                </Label>
                <p className="text-sm text-muted-foreground">Receba notificações diárias</p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={settings?.notifications_enabled}
              disabled
              onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
            />
          </div>

          {settings?.notifications_enabled && (
            <>
              <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <Label htmlFor="email-notif" className="text-base font-medium">
                      Notificações de email
                    </Label>
                  </div>
                  <Switch
                    id="email-notif"
                    disabled
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>

                {settings.email_notifications && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Endereço de email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      disabled
                      value={settings.email || ""}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <Label htmlFor="sms-notif" className="text-base font-medium">
                      Notificações SMS
                    </Label>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sistemas de notificações em breve
                </p>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>⏰ Relembrar:</strong> Todo dia as 5:00 da manhã
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você vai receber notificações para todos os hábitos marcados para o dia de hoje
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-4 p-4 rounded-xl bg-muted/50 border border-border/50">
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
                onClick={() => {
                  setShowSettingsUser((prev) => !prev)
                }}
              >
                <MoreHorizontal />
              </Button>
            </div>
          </div>

          <Dialog open={showSettingsUser} onOpenChange={setShowSettingsUser}>
            <DialogContent className='flex'>
              <DialogHeader className='flex flex-row items-center gap-2'>
                <SignOutButton children={
                   <Button variant="ghost">
                    <LogOut className='text-red-500 text-md' />
                  </Button>
                } />
                Desconectar
              </DialogHeader>
            </DialogContent>
          </Dialog>

        </div>

        <div className="flex justify-end gap-3">
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-linear-to-r from-primary to-blue-600"
            >
              {loading ? "Salvando..." : "Salvar mudanças"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
