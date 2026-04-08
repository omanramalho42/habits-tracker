"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useSignUp, useUser } from "@clerk/nextjs"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import "@/app/globals.css"

// ✅ SCHEMA
const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
})

type FormData = z.infer<typeof schema>

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()

  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const { isSignedIn } = useUser()

  useEffect(() => {
    if (isSignedIn) {
      router.push("/") // ou dashboard
    }
  }, [isSignedIn])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  // 🔥 SOCIAL LOGIN
  const handleSocialLogin = async (
    provider: "oauth_google" | "oauth_github"
  ) => {
    if (!isLoaded) return

    try {
      setLoadingProvider(provider)

      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      })
    } catch (err) {
      console.error(err)
      setLoadingProvider(null)
    }
  }

  // 📩 REGISTER
  const onSubmit = async (data: FormData) => {
    if (!isLoaded) return

    try {
      setError("")

      await signUp.create({
        emailAddress: data.email,
        password: data.password
      })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })

      setPendingVerification(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Erro ao registrar")
    }
  }

  // 🔐 VERIFY CODE
  const handleVerify = async () => {
    if (!isLoaded) return

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Código inválido")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <Card className="
        w-full max-w-95
        p-6 rounded-3xl
        bg-[#0f0f0f]
        border border-[#1f1f1f]
        shadow-[0_0_40px_rgba(255,80,0,0.08)]
      ">

        <h1 className="text-white text-xl mb-5 text-center font-semibold">
          Criar conta
        </h1>

        {/* CAPTCHA (IMPORTANTE pro Clerk) */}
        <div id="clerk-captcha" />

        {/* SOCIAL */}
        {!pendingVerification && (
          <>
            <div className="flex flex-col gap-3 mb-5 mt-4">

              <Button
                type="button"
                onClick={() => handleSocialLogin("oauth_google")}
                className="w-full flex items-center gap-3 bg-white text-black hover:bg-white/90"
              >
                <img src="/google.svg" className="w-4 h-4" />
                {loadingProvider === "oauth_google"
                  ? "Conectando..."
                  : "Google"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("oauth_github")}
                className="w-full flex items-center gap-3"
              >
                <img src="/github.svg" className="w-4 h-4" />
                {loadingProvider === "oauth_github"
                  ? "Conectando..."
                  : "GitHub"}
              </Button>

            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
            </div>
          </>
        )}

        {!pendingVerification ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

            <div>
              <Input
                placeholder="Email"
                {...register("email")}
                className="bg-[#141414] border-[#2a2a2a]"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Senha"
                {...register("password")}
                className="bg-[#141414] border-[#2a2a2a]"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Repetir senha"
                {...register("confirmPassword")}
                className="bg-[#141414] border-[#2a2a2a]"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-red-500"
            >
              {isSubmitting ? "Criando..." : "Criar conta"}
            </Button>

            <p className="text-sm text-center text-muted-foreground mt-3">
              Já tem conta?{" "}
              <span
                onClick={() => router.push("/sign-in")}
                className="text-orange-400 cursor-pointer hover:underline"
              >
                Entrar
              </span>
            </p>

          </form>
        ) : (
          <div className="flex flex-col gap-3">

            <Input
              placeholder="Código enviado no email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-[#141414] border-[#2a2a2a]"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">
                {error}
              </p>
            )}

            <Button
              onClick={handleVerify}
              className="bg-green-500 text-black hover:bg-green-400"
            >
              Verificar código
            </Button>

          </div>
        )}

      </Card>
    </div>
  )
}