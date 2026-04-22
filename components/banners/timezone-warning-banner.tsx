"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

const TimezoneWarningBanner = () => {
  const [open, setOpen] = useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />

            <Badge
              variant="outline"
              className="border-yellow-800 text-yellow-900 bg-yellow-200"
            >
              Warning
            </Badge>

            Manutenção do sistema
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">
          O aplicativo está em manutenção. O timezone está temporariamente
          instável e algumas datas podem aparecer incorretas, especialmente no
          componente de calendário dentro dos detalhes do hábito.
        </p>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TimezoneWarningBanner