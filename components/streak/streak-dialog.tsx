"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog"

import Image from "next/image"
import axios from "axios"

export function StreakDialog() {
  const [open, setOpen] = useState(false)

  const { data, isPending } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await axios.get("/api/streak")
      return res.data
    }
  })
  console.log(data, 'STREAK 🔥')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🔥 FLOATING BUTTON */}
      <DialogTrigger asChild>
        <button
          type='button'
          role='combobox'
          disabled={isPending}
          className="group relative transition-transform duration-300 hover:scale-125 focus:outline-none active:scale-95"
          title="Ver Streak"
        >
          <div className="animate-float">
            <Image
              src="/flame-bg.png" 
              alt="Ícone de fogo" 
              width={60} 
              height={60}
              className="drop-shadow-2xl"
            />
          </div>
        </button>
      </DialogTrigger>

      {/* 💎 DIALOG */}
      <DialogContent showCloseButton={false} className="
        w-auto
        bg-transparent border-none shadow-none
        flex items-center justify-center
      ">
        <div className="
          w-[320px]
          rounded-3xl
          p-5
          bg-[#0f0f0f]
          border border-[#1f1f1f]
          backdrop-blur-xl
          shadow-2xl
        ">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <Image
                  src="/flame.png"
                  fill
                  alt="flame"
                  className="object-contain drop-shadow-[0_0_6px_rgba(255,80,80,0.8)]"
                />
              </div>

              <span className="text-xs text-[#888] tracking-widest uppercase">
                Streak
              </span>
            </div>

            {/* <Flame className="text-orange-500 w-4 h-4 opacity-60" /> */}
          </div>

          {/* STREAK NUMBER */}
          <div className="mb-4">
            <span className="text-white text-3xl font-bold">
              {data?.currentStreak ?? 0}
            </span>
            <span className="text-[#888] text-sm ml-1">
              dias
            </span>
          </div>

          {/* WEEK */}
          <div className="flex justify-between mb-4">
            {data?.weekDays?.map((day: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1">
                
                {day.completed ? (
                  <div className="
                    w-6 h-6 rounded-full
                    bg-green-500 flex items-center justify-center
                  ">
                    <span className="text-[10px] text-black">✓</span>
                  </div>
                ) : (
                  <div className="
                    w-6 h-6 rounded-full
                    bg-[#2a2a2a]
                  " />
                )}

                <span className="text-[10px] text-[#666]">
                  {day.day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* STEPS (FAKE POR ENQUANTO OU ADAPTAR DEPOIS) */}
          <div className="mb-2">
            <span className="text-[#888] text-xs uppercase tracking-widest">
              Progresso
            </span>
          </div>

          <div className="flex items-end justify-between mb-1">
            <span className="text-white text-lg font-semibold">
              {data?.currentStreak ?? 0}/
              {data?.nextMilestone ?? 100}
            </span>

            <span className="text-[#888] text-xs">
              {data?.progress ?? 0}%
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div className="h-2 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${data?.progress ?? 0}%`
              }}
            />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}