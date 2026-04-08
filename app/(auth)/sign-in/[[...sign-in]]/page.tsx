"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useSignIn, useUser } from "@clerk/nextjs"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { ArrowRight, Apple, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import "@/app/globals.css"

// Validação com Zod traduzida
const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type FormData = z.infer<typeof schema>

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
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
    resolver: zodResolver(schema),
    defaultValues: {
      email: "elisesmorisev@gmail.com"
    }
  })

  const handleSocialLogin = async (provider: "oauth_google" | "oauth_apple" | "oauth_twitter") => {
    if (!isLoaded) return
    try {
      setLoadingProvider(provider)
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      })
    } catch (err) {
      toast.error("Erro ao conectar com a conta social")
      setLoadingProvider(null)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!isLoaded) return
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        toast.success("Bem-vindo de volta!")
        router.push("/")
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "E-mail ou senha incorretos")
    }
  }

  // Estado de Carregamento (Skeleton)
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Skeleton className="w-95 h-137.5 rounded-[40px] bg-white/5" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] font-sans antialiased">
      
      {/* Container com borda gradiente (efeito de luz no topo) */}
      <div className="relative w-full max-w-95 p-px rounded-[40px] bg-linear-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
        
        {/* Card Principal com Glassmorphism */}
        <div className="bg-black/50 backdrop-blur-3xl p-10 rounded-[39px] overflow-hidden">
          
          {/* Brilho avermelhado no fundo (Glow) */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-600/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Cabeçalho */}
          <div className="text-center mb-9 relative z-10">
            <h1 className="text-white text-3xl font-medium tracking-tight">
              Bem-vindo
            </h1>
            <p className="text-zinc-500 text-sm mt-2">
              Acesse sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Campo de E-mail */}
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 ml-4">
                E-mail:
              </Label>
              <Input
                {...register("email")}
                className="h-12 bg-white/5 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                placeholder="seu@email.com"
              />
              {errors.email && 
                <span className="text-[10px] text-red-500 ml-4 block">
                  {errors.email.message}
                </span>
              }
            </div>

            {/* Campo de Senha + Botão de Seta */}
            <div className="space-y-1 relative">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 ml-4">
                Senha:
              </Label>
              <div className="relative">
                <Input
                  type="password"
                  {...register("password")}
                  className="h-12 bg-white/5 border border-zinc-800 rounded-2xl text-white pr-14 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                  placeholder="••••••••••"
                />
                
                {/* Botão de Seta Rosa Gradiente */}
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-linear-to-br from-red-500 via-pink-600 to-rose-600 flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-red-500/20"
                >
                  <ArrowRight size={18} strokeWidth={2.5}/>
                </Button>
              </div>
              {errors.password && 
                <span className="text-[10px] text-red-500 ml-4 block">
                  {errors.password.message}
                </span>
              }
            </div>

            {/* Esqueci a Senha - No seu SignInScreen */}
            <div className="text-right">
              <Button
                type="button"
                variant="ghost" // Mudado para ghost para ficar mais limpo
                onClick={() => router.push("/forgot-password")}
                className="text-[11px] text-zinc-500 hover:text-white transition-colors"
              >
                Esqueceu a senha?
              </Button>
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">
                Ou
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            {/* Ícones Sociais */}
            <div className="flex justify-between px-2">
              <IconeSocial
                onClick={() =>
                  handleSocialLogin("oauth_apple")
                }
                icon={
                  <Apple size={22} />
                }
              />
              <IconeSocial
                onClick={() =>
                  handleSocialLogin("oauth_google")
                }
                icon={
                  <div className="font-bold text-xl">
                    G
                  </div>
                }
              />
              <IconeSocial
                onClick={() =>
                  handleSocialLogin("oauth_twitter")
                }
                icon={
                  <Twitter size={22} />
                }
              />
            </div>

            {/* Rodapé (Criar Conta) */}
            <div className="text-center mt-10">
              <p className="text-zinc-500 text-xs">
                Ainda não tem uma conta?{" "}
                <Button 
                  type="button"
                  role="button"
                  variant="ghost"
                  onClick={() => router.push("/sign-up")}
                  className="text-red-500 hover:text-red-400 hover:underline font-medium transition-colors"
                >
                  Cadastre-se
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Sub-componente para os botões sociais
function IconeSocial({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-14 h-14 rounded-2xl bg-white/5 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all"
    >
      {icon}
    </button>
  )
}