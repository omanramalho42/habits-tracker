"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Mail, KeyRound } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

const resetSchema = z.object({
  code: z.string().min(6, "O código deve ter 6 dígitos"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export default function ForgotPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  
  // Etapas: 1 = Inserir Email, 2 = Código + Nova Senha
  const [step, setStep] = useState(1)
  const [userEmail, setUserEmail] = useState("")

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
  })

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  })

  // Passo 1: Enviar Token
  const onSendToken = async (data: { email: string }) => {
    if (!isLoaded) return
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      })
      setUserEmail(data.email)
      setStep(2)
      toast.success("Código enviado para seu e-mail!")
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Erro ao solicitar recuperação")
    }
  }

  // Passo 2: Verificar Código e Resetar
  const onResetPassword = async (data: z.infer<typeof resetSchema>) => {
    if (!isLoaded) return
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        toast.success("Senha alterada com sucesso!")
        router.push("/")
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Código inválido ou erro no reset")
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Skeleton className="w-95 h-96 rounded-[40px] bg-white/5" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <div className="relative w-full max-w-95 p-px rounded-[40px] bg-linear-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
        <div className="bg-black/50 backdrop-blur-3xl p-10 rounded-[39px] overflow-hidden relative">
          
          {/* Glow Effect */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-pink-600/10 blur-[60px] rounded-full pointer-events-none" />

          <button 
            onClick={() => step === 1 ? router.push("/sign-in") : setStep(1)}
            className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center mb-9">
            <h1 className="text-white text-2xl font-medium tracking-tight">
              {step === 1 ? "Recuperar Senha" : "Nova Senha"}
            </h1>
            <p className="text-zinc-500 text-xs mt-2 px-4">
              {step === 1 
                ? "Insira seu e-mail para receber o código de verificação." 
                : `Enviamos um código para ${userEmail}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={emailForm.handleSubmit(onSendToken)} className="space-y-6">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 ml-4">E-mail Cadastrado:</Label>
                <div className="relative">
                  <Input
                    {...emailForm.register("email")}
                    className="h-12 bg-white/5 border border-zinc-800 rounded-2xl text-white pr-12"
                    placeholder="exemplo@labhabits.com"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                </div>
                {emailForm.formState.errors.email && (
                  <span className="text-[10px] text-red-500 ml-4">{emailForm.formState.errors.email.message}</span>
                )}
              </div>

              <Button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="w-full h-12 rounded-2xl bg-linear-to-r from-red-500 to-pink-600 text-white font-bold hover:scale-[1.02] transition-transform"
              >
                ENVIAR CÓDIGO
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-5">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 ml-4">Código de 6 dígitos:</Label>
                <Input
                  {...resetForm.register("code")}
                  className="h-12 bg-white/5 border border-zinc-800 rounded-2xl text-white text-center tracking-[0.5em] font-bold"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 ml-4">Nova Senha:</Label>
                <div className="relative">
                  <Input
                    type="password"
                    {...resetForm.register("password")}
                    className="h-12 bg-white/5 border border-zinc-800 rounded-2xl text-white pr-12"
                    placeholder="••••••••"
                  />
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full h-12 rounded-2xl bg-linear-to-r from-red-500 to-pink-600 text-white font-bold"
              >
                REDEFINIR SENHA
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}