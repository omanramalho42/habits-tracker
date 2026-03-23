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

const HeaderSection:React.FC = () => {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const { user } = useUser()
  const {
    data: userSettings,
  } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })
  
  return (
    <div className="flex items-start justify-between">
      
      <div className="flex flex-col space-y-2">
        <div className='flex flex-row items-baseline gap-2'>
          <Avatar>
            <AvatarImage
              src={userSettings?.avatarUrl || ""}
              alt="@avatar"
            />
            <AvatarFallback>
              {userSettings?.name?.slice(0,2) || user?.fullName?.slice(0,2)}
            </AvatarFallback>
            {/* <AvatarBadge className="bg-green-600 dark:bg-green-800" /> */}
          </Avatar>
          <h1 className="text-1xl font-bold text-foreground mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text">
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