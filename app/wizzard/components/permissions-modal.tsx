"use client"

import { useState } from "react"
import { X, Mic, Video, Monitor } from "lucide-react"

interface Permission {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
  iconBg: string
  iconColor: string
}

interface PermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (permissions: Record<string, boolean>) => void
}

export default function PermissionsModal({ isOpen, onClose, onContinue }: PermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "microphone",
      icon: <Mic className="w-5 h-5" />,
      title: "Microfone",
      description: "Para que todos possam te ouvir",
      enabled: true,
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      id: "camera",
      icon: <Video className="w-5 h-5" />,
      title: "Câmera",
      description: "Para que todos possam te ver",
      enabled: false,
      iconBg: "bg-slate-500/20",
      iconColor: "text-slate-400"
    },
    {
      id: "screen",
      icon: <Monitor className="w-5 h-5" />,
      title: "Compartilhamento de tela",
      description: "Para que todos possam ver sua tela",
      enabled: false,
      iconBg: "bg-slate-500/20",
      iconColor: "text-slate-400"
    }
  ])

  const togglePermission = (id: string) => {
    setPermissions(prev => 
      prev.map(p => 
        p.id === id 
          ? { 
              ...p, 
              enabled: !p.enabled,
              iconBg: !p.enabled ? "bg-emerald-500/20" : "bg-slate-500/20",
              iconColor: !p.enabled ? "text-emerald-400" : "text-slate-400"
            } 
          : p
      )
    )
  }

  const handleContinue = () => {
    const permissionState = permissions.reduce((acc, p) => {
      acc[p.id] = p.enabled
      return acc
    }, {} as Record<string, boolean>)
    onContinue(permissionState)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[400px] bg-[#0c0c0c] rounded-[28px] border border-[#1a1a1a] overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px]" />
        </div>
        
        <div className="relative p-6">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 bg-[#1a1a1a] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-[#666]" />
          </button>

          {/* Header */}
          <div className="mb-6 pr-10">
            <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">
              Só um momento...
            </h2>
            <p className="text-[15px] text-[#666]">
              Permitir acesso aos seus dispositivos
            </p>
          </div>

          {/* Permissions List */}
          <div className="space-y-3 mb-6">
            {permissions.map((permission) => (
              <div 
                key={permission.id}
                className="flex items-center justify-between p-3 bg-[#111]/80 rounded-2xl border border-[#1a1a1a]"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-11 h-11 ${permission.iconBg} rounded-xl flex items-center justify-center transition-colors`}>
                    <span className={permission.iconColor}>
                      {permission.icon}
                    </span>
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h3 className="text-[15px] font-medium text-white">
                      {permission.title}
                    </h3>
                    <p className="text-[13px] text-[#555]">
                      {permission.description}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => togglePermission(permission.id)}
                  className={`relative w-[52px] h-[30px] rounded-full transition-colors ${
                    permission.enabled ? "bg-emerald-500" : "bg-[#333]"
                  }`}
                  aria-label={`Toggle ${permission.title}`}
                >
                  <div 
                    className={`absolute top-[3px] w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      permission.enabled ? "left-[25px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full h-[52px] bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-[16px] rounded-2xl transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
