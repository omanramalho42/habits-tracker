
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
import CreateFeedbackDialog from "@/components/feedback/create-feedback-dialog"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/routines/bottom-navigation"
import { prisma } from "@/lib/prisma"

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
  const user = await currentUser()

  const userDb = await prisma.user.findUnique({
    where: {
      clerkUserId: user?.id
    }
  })

  if(!userDb) {
    redirect("/login")
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: userDb.id
    }
  })

  console.log(userSettings, "APP 🪄");
  
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
        suppressHydrationWarning
        lang="pt-BR"
        className={
          cn(
            userSettings ? userSettings.theme : "dark",
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
              defaultTheme={userSettings?.theme || "system"}
              enableSystem
              disableTransitionOnChange
            > */}
              <main
                className={
                  cn(
                    `min-h-screen transition-all bg-background bg-[url('/bg.png')] bg-contain bg-no-repeat bg-top`,
                    userSettings?.bannerUrl ? `bg-[url'${userSettings.bannerUrl}']` : "bg-[url('/bg.png')]"
                  )
                }
                style={{
                  backgroundImage: userSettings?.bannerUrl ? `url(${userSettings?.bannerUrl})` : `bg-[url('/bg.png')]`
                }}
              >     
                <TimezoneWarningBanner />
                {children}
                <CreateFeedbackDialog
                  trigger={
                    <Button
                      className="fixed opacity-75 bottom-20 right-10"
                      variant="default"
                      type="button"
                      size="icon-lg"
                    >
                      <p>✨</p>
                    </Button>
                  }
                />
                <BottomNavigation />
              </main>
            {/* </ThemeProvider> */}
            <Analytics />
          </QueryClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
