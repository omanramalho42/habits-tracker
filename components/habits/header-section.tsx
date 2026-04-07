"use client"

import React from 'react'

import { useQuery } from '@tanstack/react-query'

import { useUser } from '@clerk/nextjs'

const Clock = dynamic(
  async () => await import('react-live-clock'),
  { loading: () => <Skeleton className='w-32 h-10' />}
)

import dynamic from 'next/dynamic'

import { fetchUserSettings } from '@/services/settings'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

import type { UserSettings } from '@prisma/client'
import CreatePixKeyDialog from '../modals/create-pix-key-dialog'
import { StreakDialog } from '../streak/streak-dialog'

const HeaderSection:React.FC = () => {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const { user } = useUser()
  const {
    data: userSettings,
    isLoading,
  } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })
  
  return (
    <div className="flex flex-row-reverse py-2 items-start justify-between">
      
      <div className='flex flex-row items-center gap-1'>
        {!isLoading && (
          <CreatePixKeyDialog
            userSettings={userSettings}
          />
        )}
        <StreakDialog />
      </div>
      <div className="flex flex-col space-y-2">

        <div className='flex flex-row items-center gap-2'>
          <Avatar className='w-12 h-12'>
            <AvatarImage
              src={userSettings?.avatarUrl || ""}
              alt="@avatar"
            />
            <AvatarFallback>
              {userSettings?.name?.slice(0,2) || user?.fullName?.slice(0,2)}
            </AvatarFallback>
            {/* <AvatarBadge className="bg-green-600 dark:bg-green-800" /> */}
          </Avatar>
          <h1 className="text-1xl font-bold text-foreground bg-linear-to-r from-primary to-blue-600 bg-clip-text">
            Olá, {userSettings?.name || user?.fullName} 👋
          </h1>
        </div>
        <p className="text-muted-foreground text-base">
          {today}
        </p>
        <h1 className='text-2xl font-bold text-yellow-500'>
          <Clock
            format={'HH:mm:ss'}
            ticking={true}
            timezone={'America/Sao_paulo'}
          />
        </h1>
      </div>
    </div>
  )
}

export default HeaderSection