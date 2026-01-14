
import type React from "react"
import type { Metadata } from "next"

import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"


import "./globals.css"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Toaster } from "sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wisey - Habit Tracker",
  description: "Your personal coach, guiding mindfulness and cognitive growth",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#06B6D4",
          colorBackground: "#0a0a0f",
          colorInputBackground: "#1a1a2e",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90",
          card: "bg-[#1a1a2e] border-cyan-500/20",
          headerTitle: "text-cyan-400",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "border-cyan-500/20 hover:bg-cyan-500/10",
          formFieldInput: "bg-[#0f0f1a] border-cyan-500/20 text-white",
          footerActionLink: "text-cyan-400 hover:text-cyan-300",
        },
      }}
    >
      <html lang="pt-BR" className="dark">
        <body className={`font-sans antialiased`}>
          
          {children}
          <Toaster theme="dark" />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
