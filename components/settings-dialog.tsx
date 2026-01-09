"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mail, MessageSquare, Bell } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    notifications_enabled: false,
    email_notifications: false,
    sms_notifications: false,
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Settings saved!",
          description: "Your notification preferences have been updated.",
        })
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage your notification preferences and account settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="notifications" className="text-base font-semibold">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive daily habit reminders</p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
            />
          </div>

          {settings.notifications_enabled && (
            <>
              <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <Label htmlFor="email-notif" className="text-base font-medium">
                      Email Notifications
                    </Label>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>

                {settings.email_notifications && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
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
                      SMS Notifications
                    </Label>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">SMS notifications coming soon!</p>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>⏰ Reminder Time:</strong> Daily at 5:00 AM
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll receive reminders for all habits scheduled for that day
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-primary to-blue-600">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
