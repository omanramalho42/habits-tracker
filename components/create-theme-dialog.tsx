"use client"

import React, { useState } from 'react'

import z from 'zod'

import { HexColorPicker } from 'react-colorful'
import {
  Controller,
  SubmitHandler,
  useForm
} from 'react-hook-form'

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
import { Form } from '@/components/ui/form'

interface CreateThemeDialogProps {
  trigger?: React.ReactNode
}

const CreateThemeDialog:React.FC<CreateThemeDialogProps> = ({
  trigger
}) => {
  const [open, setOpen] =
    useState<boolean>(false)

  const createThemeSchema = z.object({
    theme: z.string()
  })

  type CreateTehemSchemaType = z.infer<typeof createThemeSchema>

  const form = useForm<CreateTehemSchemaType>({
    defaultValues: {
      theme: ""
    }
  })

  const {
    control,
    handleSubmit,
    reset
  } = form

  const onSubmit: SubmitHandler<CreateTehemSchemaType> = (values) => {
    console.log(values, "values")

    reset()

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            role="button"
            type="button"
            variant="outline"
            aria-expanded={open}
          >
            Criar novo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Tema
          </DialogTitle>
          <DialogDescription>
            Altere a cor do seu tema do jeito que quiser 🪄
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='flex w-full items-center justify-center'>
            <Controller
              name='theme'
              control={control}
              render={({ field }) => {
                return (
                  <HexColorPicker
                    color={field.value}
                    onChange={field.onChange}
                  />
                )
              }}
            />
          </form>
        </Form>

        <DialogFooter className='flex flex-row-reverse gap-2 items-center justify-end my-2'>
          <DialogClose asChild>
            <Button
              role='button'
              type='button'
              variant="outline"
            >
              <p className='text-sm text-destructive'>
                Cancelar
              </p>
            </Button>
          </DialogClose>
          <Button
            role='button'
            onClick={handleSubmit(onSubmit)}
            type='button'
            variant="default"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>


    </Dialog>
  )
}

export default CreateThemeDialog