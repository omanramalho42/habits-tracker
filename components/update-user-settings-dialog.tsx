"use client"

import React, { useState, useRef } from 'react'

import { useForm } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { udapteUserSettings } from '@/app/habits/_actions/settings/user-settings'

import { Uploader } from '@/components/uploader'
import ThemePicker from '@/components/theme-picker'

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
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import {
  PenIcon,
  PlusSquare
} from 'lucide-react'

import type { UpdateUserSettingSchemaType } from '@/lib/schema/user-settings'
import type { UserSettings } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface UpdateUserSettingsDialogProps {
  trigger: React.ReactNode
  userSettings: any
}

const UpdateUserSettingsDialog:React.FC<UpdateUserSettingsDialogProps> = ({
  trigger,
  userSettings
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)  

  console.log(userSettings, "settings ⚙️");

  const form = useForm<UpdateUserSettingSchemaType>({
    defaultValues: {
      id: userSettings.id,
      name: userSettings.name,
      phone: userSettings.phone,
      email: userSettings.email,
      allow_notifications: userSettings.notificationsEnabled,
      emailNotifications: userSettings.emailNotifications,
      smsNotifications: userSettings.smsNotifications,
      isTravelling: false,
      theme: userSettings?.theme,
      bannerUrl: [],
      avatarUrl: [],
    }
  })

  const {
    formState: { errors, isLoading },
    control,
    watch,
    handleSubmit
  } = form

  const [avatarUrl, setAvatarUrl] =
    useState<string>(userSettings.avatarUrl)

  const queryClient = useQueryClient()
  const router = useRouter()
  const onSubmit = async (values: UpdateUserSettingSchemaType) => {
    toast.loading(
      "Atualizando configurações do usuário",
      { id: 'update-settings' }
    )

    try {
      console.log(values, "values !")
      const res = await udapteUserSettings(values)
      // const res = 
      //   await axios.patch(
      //     "/api/settings",
      //     values
      //   )
  
      if(res) {
        toast.success(
          "Configurações do usuário atualizadas com sucesso! 🎉",
          { id: 'update-settings' }
        )

        setOpen((prev) => !prev)

        queryClient.invalidateQueries({
          queryKey: ["user-settings"],
          exact: false,
        })

        router.refresh()
        
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
        toast.error(
          "Houve um erro ao atualizar configurações do usuário",
          { id: 'update-settings' }
        )
      }
    }
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
            <div className="flex flex-row gap-2 items-baseline">

              <FormField
                control={control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-sm">
                      Avatar
                    </FormLabel>

                    <FormControl>
                      <div className="flex items-center gap-3">

                        {/* AVATAR */}
                        <Avatar>
                          <AvatarImage
                            src={avatarUrl}
                            className=""
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>

                        {/* INPUT FILE (hidden) */}
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const previewUrl = URL.createObjectURL(file)
                            setAvatarUrl(previewUrl)

                            field.onChange(file)
                          }}
                        />

                        {/* BOTÃO */}
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="relative bottom-4 right-4"
                          variant="ghost"
                          size="icon-sm"
                        >
                          <PenIcon className="w-4 h-4" />
                        </Button>

                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='name'
                rules={{ required: true, min: 5 }}
                render={( { field }) => (
                  <FormItem className='w-full flex flex-col gap-3'>
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
                        {...field}
                        id='name'
                        type='text'
                        placeholder='ex: John Doe'
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        className=''
                      />
                    </FormControl>
                    {errors.name && (
                      <span className='text-red-500 text-sm'>
                        {errors.name.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
            </div>

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
                      {...field}
                      id='email'
                      type='email'
                      placeholder='ex: johndoe@example.com'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  {errors.email && (
                    <span className='text-red-500 text-sm'>
                      {errors.email.message}
                    </span>
                  )}
                </FormItem>
              )}
            />

            <React.Fragment>
              <Label>
                Tema
              </Label>
              <ThemePicker
                control={control}
              />
            </React.Fragment>

            <React.Fragment>
              <FormField
                control={control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem de fundo</FormLabel>
                    <FormControl>
                      <Uploader
                        files={field.value}
                        onSuccessCallback={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </React.Fragment>

            <React.Fragment>
              <div className="flex flex-col gap-4 mt-2">

                <Label className="text-sm font-semibold">
                  Notificações
                </Label>

                {/* MASTER SWITCH */}
                <FormField
                  control={control}
                  name="allow_notifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          Ativar notificações
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Controle geral das notificações
                        </span>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>

                    </FormItem>
                  )}
                />

                {/* CHILDREN */}
                {watch("allow_notifications") && (
                  <div className="flex flex-col gap-3 pl-2 border-l border-white/10">

                    {/* EMAIL */}
                    <FormField
                      control={control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                          
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              Email
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Receba lembretes por email
                            </span>
                          </div>

                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>

                        </FormItem>
                      )}
                    />

                    {/* SMS */}
                    <FormField
                      control={control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                          
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              SMS
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Receba notificações por SMS
                            </span>
                          </div>

                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>

                        </FormItem>
                      )}
                    />

                  </div>
                )}

              </div>
            </React.Fragment>

          </form>
        </Form>

        <DialogFooter className='flex flex-row-reverse justify-end items-center gap-2'>
          <DialogClose asChild>
            <Button
              type='button'
              role='button'
              variant="outline"
            >
              <p className='text-destructive tracking-tighter text-sm'>
                Cancelar
              </p>
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