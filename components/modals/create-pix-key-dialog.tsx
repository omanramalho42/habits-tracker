"use client"

import React, { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from 'next/image'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form, 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import axios from 'axios'

// 1. Schema atualizado com o campo pixKey
const updateSettingsSchema = z.object({
  name: z.string().min(2, "Nome é necessário para identificação"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  phone: z.string().min(8, "Telefone inválido").optional().or(z.literal('')),
  pixKey: z.string().min(1, "A chave Pix é obrigatória para o recebimento"), // <-- Novo campo
})

type UpdateSettingsSchemaType = z.infer<typeof updateSettingsSchema>

interface CreatePixKeyDialogProps {
  trigger?: React.ReactNode
}

const CreatePixKeyDialog = ({ trigger }: CreatePixKeyDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<UpdateSettingsSchemaType>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      pixKey: "", // <-- Valor padrão
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: UpdateSettingsSchemaType) => {
      const response = await axios.patch('/api/settings', values)
      
      if (!response.data) throw new Error('Erro ao atualizar dados')
      return response.data
    },
    onSuccess: () => {
      toast.success("Dados atualizados! Seu presente está a caminho 🎁", {
        id: "update-settings"
      })
      queryClient.invalidateQueries({ queryKey: ["user-settings"] })
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error(`Ops! ${error.message}`, { id: "update-settings" })
    }
  })

  const onSubmit = useCallback((values: UpdateSettingsSchemaType) => {
    toast.loading("Enviando informações...", { id: "update-settings" })
    mutate(values)
  }, [mutate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button 
            className="group relative transition-transform duration-300 hover:scale-125 focus:outline-none active:scale-95"
            title="Ganhar Presente"
          >
            <div className="animate-float">
              <Image 
                src="/gift-box.png" 
                alt="Ícone de Presente" 
                width={80} 
                height={80}
                className="drop-shadow-2xl"
              />
            </div>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[400px] w-[95vw] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Resgatar Presente 🎁
          </DialogTitle>
          <DialogDescription>
            Confirme seus dados e sua chave Pix para receber o bônus.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Campo Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-muted-foreground">Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Como está no seu banco..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Chave Pix (DESTAQUE) */}
            <FormField
              control={form.control}
              name="pixKey"
              render={({ field }) => (
                <FormItem className="p-3 border-2 border-dashed border-purple-500/30 rounded-lg bg-purple-500/5">
                  <FormLabel className="font-bold text-purple-600 dark:text-purple-400">
                    Chave Pix (CPF, E-mail ou Celular)
                  </FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Digite sua chave pix aqui" 
                        className="border-purple-500/50 focus-visible:ring-purple-500"
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                 {/* Campo Email */}
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-bold text-xs">E-mail de Contato</FormLabel>
                    <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Campo Telefone */}
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-bold text-xs">Telefone</FormLabel>
                    <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                {isPending ? "Processando..." : "Confirmar e Ganhar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePixKeyDialog