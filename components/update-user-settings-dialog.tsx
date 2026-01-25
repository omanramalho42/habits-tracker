"use client"

import React, { useState } from 'react'

import { SignOutButton } from '@clerk/nextjs'

import { useForm } from 'react-hook-form'

import z from 'zod'

import { toast } from 'sonner'

import {
  Dialog,
  DialogClose,
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
  FormLabel
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import {
  Bell,
  BellDot,
  LogOut,
  Mail,
  MessageSquare,
  PlusSquare
} from 'lucide-react'

interface UpdateUserSettingsDialogProps {
  trigger: React.ReactNode
}

const UpdateUserSettingsDialog:React.FC<UpdateUserSettingsDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState<boolean>(false)

  const UpdateUserSettingsSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    allow_notifications: z.boolean().default(false),
    isTravelling: z.boolean().default(false),
    theme: z.enum(["light", "dark", "system"]).optional(),
  })

  type UpdateUserSettingsSchemaType = z.infer<typeof UpdateUserSettingsSchema>

  const form = useForm<UpdateUserSettingsSchemaType>({
    defaultValues: {
      name: "",
      email: "",
      allow_notifications: false,
      theme: "dark",
      isTravelling: false
    }
  })
  const {
    formState: { errors, isLoading },
    control,
    reset,
    watch,
    handleSubmit
  } = form

  const onSubmit = (values: UpdateUserSettingsSchemaType) => {
    console.log(values, "values")
    toast.loading(
      "Atualizando configurações do usuário",
      { id: 'update-settings' }
    )

    // setOpen((prev) => !prev)
    // reset({
    //   name: ""
    // })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            disabled={isLoading}
            className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar novo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='max-w-[90vw]'>

        <DialogHeader>
          <DialogTitle className='text-2xl'>
            Ajustes
          </DialogTitle>
          <DialogDescription className='text-sm'>
            Configurações da conta e preferências
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-3'>
            <FormField
              control={control}
              name='name'
              rules={{ required: true }}
              render={( { field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      className='font-semibold'
                      htmlFor='name'
                    >
                      Nome
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='name'
                      type='text'
                      placeholder='ex: John Doe'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className=''
                    />
                  </FormControl>
                  {errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='email'
              rules={{ required: true }}
              render={( { field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      className='font-semibold'
                      htmlFor='email'
                    >
                      Email
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='email'
                      type='email'
                      placeholder='ex: johndoe@example.com'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className=''
                    />
                  </FormControl>
                  {errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
                </FormItem>
              )}
            />

            {/* ALLOW NOTIFICATIONS */}
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 my-2 px-2">
                  <FormField
                    control={control}
                    name='allow_notifications'
                    rules={{ required: false }}
                    render={( { field }) => (
                      <FormItem className='flex flex-row justify-between w-full items-center'>
                        <FormLabel>
                          <BellDot className="h-5 w-5 text-yellow-500" />
                          <Label htmlFor="allow_notifications" className="text-base font-medium">
                            Central de notificações
                          </Label>
                        </FormLabel>
                        <FormControl> 
                          <Switch
                            id="allow_notifications"
                            checked={field.value}
                            disabled
                            defaultChecked={false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        {errors.allow_notifications && <span className='text-red-500 text-sm'>{errors.allow_notifications.message}</span>}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {watch("allow_notifications") && (
                <>
                  {/* EMAIL */}
                  <div className="flex items-center justify-between space-x-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label htmlFor="email-notif" className="text-base font-medium">
                          Notificações de email
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações diárias
                        </p>
                      </div>
                    </div>
                    <Switch
                      disabled
                    />
                  </div>
                  {/* SMS */}
                  <div className="flex items-center justify-between space-x-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <div>
                        <Label htmlFor="email-notif" className="text-base font-medium">
                          Notificações de SMS
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações diárias
                        </p>
                      </div>
                    </div>
                    <Switch
                      disabled
                    />
                  </div>
                </>
              )}
            </>

          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            disabled={isLoading}
            type='button'
            onClick={handleSubmit(onSubmit)}
          >
            {!isLoading ? 'Salvar' : 'Salvando'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateUserSettingsDialog