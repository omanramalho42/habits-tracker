
import type React from "react"
import type { Metadata } from "next"

import { ClerkProvider } from "@clerk/nextjs"
import { JetBrains_Mono, Space_Grotesk } from "next/font/google"

import { Analytics } from "@vercel/analytics/next"

import { Toaster } from "sonner"

import QueryClientProvider from "@/components/providers/query-client-provider"

import { ThemeProvider } from "@/components/theme-provider"

import { cn } from "@/lib/utils"

import { syncCurrentUser } from "@/lib/sync-user"

import "@/app/globals.css"
import { SoundProvider } from "@/components/trial-wizzard/sound-provider"

const jetBrainsMono =
  JetBrains_Mono({ subsets: ["latin"] })
const spaceGrotesk =
  Space_Grotesk({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lab Habits - Laboratório de hábitos",
  description: "Gerêncie seus hábitos e rotinas de forma dinâmica",
  generator: "Oman Company",
  icons: {
    icon: [
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/logo.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
// Sincroniza e busca os dados do banco
  const userDb = await syncCurrentUser()
  const settings = userDb?.settings

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
        suppressHydrationWarning
        lang="pt-BR"
        className={
          cn(
            settings ? settings.theme : "dark",
            // spaceGrotesk.className,
            jetBrainsMono.className
          )
        }
      >
        <body className={`antialiased`}>
          <Toaster theme="dark" />
          <QueryClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme={settings?.theme || "system"}
              // enableSystem
              // disableTransitionOnChange
            >
              <SoundProvider>
                <main
                  className={
                    cn(
                      `min-h-screen transition-all bg-background bg-[url('/bg.png')] bg-contain bg-no-repeat bg-top`,
                      settings?.bannerUrl ? `bg-[url'${settings.bannerUrl}']` : "bg-[url('/bg.png')]"
                    )
                  }
                  style={{
                    backgroundImage: settings?.bannerUrl ? `url(${settings?.bannerUrl})` : `bg-[url('/bg.png')]`
                  }}
                >
                  { children }
                </main>
              </SoundProvider>
            </ThemeProvider>
            <Analytics />
          </QueryClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
