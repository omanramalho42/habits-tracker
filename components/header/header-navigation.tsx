"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, UserButton } from "@clerk/nextjs"
import { 
  LayoutDashboard,
  Zap, 
  BarChart3, 
  Settings, 
  LogOut,
  Newspaper,
  Wand2
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react"
import Image from "next/image"
import { User, UserSettings } from "@prisma/client"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Hábitos", icon: Zap },
  { href: "/statistics", label: "Estatísticas", icon: BarChart3 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/wizzard", label: "Wizzard", icon: Wand2 },
  { href: "/settings", label: "Ajustes", icon: Settings },
]

const HeaderNavigation: React.FC< { settings?: (UserSettings & { user: User }) } > = ({ settings }) => {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#1a1a1c] bg-[#09090b]/80 backdrop-blur-md">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          {/* <div className="h-8 w-8 bg-linear-to-tr from-purple-600 to-blue-500 rounded-lg flex items-center justify-center"> */}
            <Image
              src="/logo.png"
              alt="logo"
              width={20}
              height={20}
              className="text-white sm:h-8 sm:w-8 w-5 h-5 fill-white"
            />
          {/* </div> */}
          <span className="font-bold tracking-tighter text-xl hidden md:block">
            LAB<span className="text-purple-500">HABIT</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                  isActive ? "text-white" : "text-[#555] hover:text-[#888]"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:block">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <div className="absolute -bottom-4.25 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-4 pl-4 border-l border-[#1a1a1c]">
          <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                {settings?.user?.role || "FREE"}
              </span>
          </div>
{/*           
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 border border-[#1a1a1c] hover:border-purple-500/50 transition-all"
              }
            }}
          /> */}

          <SignOutButton>
            <button className="p-2 text-[#555] hover:text-red-400 transition-colors group">
              <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignOutButton>
        </div>

      </div>
    </header>
  )
}

export default HeaderNavigation