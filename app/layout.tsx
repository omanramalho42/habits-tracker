
import type React from "react"
import type { Metadata } from "next"

import { ClerkProvider } from "@clerk/nextjs"
import { JetBrains_Mono, Space_Grotesk } from "next/font/google"

import { Analytics } from "@vercel/analytics/next"

import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import { Toaster } from "sonner"

import QueryClientProvider from "@/components/providers/query-client-provider"
import TimezoneWarningBanner from "@/components/banners/timezone-warning-banner"

import { ThemeProvider } from "@/components/theme-provider"

import { cn } from "@/lib/utils"

import "./globals.css"

const jetBrainsMono =
  JetBrains_Mono({ subsets: ["latin"] })
const spaceGrotesk =
  Space_Grotesk({ subsets: ["latin"] })

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
      <html
        lang="pt-BR"
        className={
          cn(
            "dark",
            // spaceGrotesk.className,
            jetBrainsMono.className
          )
        }
      >
        <body className={`antialiased`}>
          <Toaster theme="dark" />
          <QueryClientProvider>
            {/* <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            > */}
              <main>     
                <TimezoneWarningBanner />
                {children}
              </main>
            {/* </ThemeProvider> */}
            <Analytics />
          </QueryClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
