"use client"

import { useQuery } from "@tanstack/react-query"

import axios from "axios"

import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { fetchNews } from "@/services/news"

import Image from "next/image"

import {
  Card,
  CardContent
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import HeaderSection from "@/components/habits/header-section"
import Footer from "@/components/habits/footer"

import type { Feedback, User } from "@prisma/client"

/* ------------------------------- */
/* tipos */
/* ------------------------------- */
interface Commit {
  id: string
  message: string
  author: string
  avatar: string
  date: string
  url: string
}

/* ------------------------------- */
/* commit type */
/* ------------------------------- */
function getCommitType(message: string) {
  if (message.startsWith("feat"))
    return { label: "Feature", color: "bg-green-500" }

  if (message.startsWith("fix"))
    return { label: "Bug Fix", color: "bg-red-500" }

  if (message.startsWith("refactor"))
    return { label: "Refactor", color: "bg-yellow-500" }

  if (message.startsWith("perf"))
    return { label: "Performance", color: "bg-blue-500" }

  if (message.startsWith("docs"))
    return { label: "Docs", color: "bg-purple-500" }

  return { label: "Update", color: "bg-gray-500" }
}

/* ------------------------------- */
/* status badge */
/* ------------------------------- */
function getFeedbackStatus(status: string) {
  switch (status) {
    case "OPEN":
      return { label: "Aberto", color: "bg-yellow-500" }
    case "REVIEWING":
      return { label: "Em progresso", color: "bg-blue-500" }
    case "CLOSE":
      return { label: "Resolvido", color: "bg-green-500" }
    default:
      return { label: status, color: "bg-gray-500" }
  }
}

export default function NewsPage() {
  /* ------------------------------- */
  /* NEWS */
  /* ------------------------------- */
  const {
    data: dataNews = [],
    isLoading: isLoadingNews
  } = useQuery<Commit[]>({
    queryKey: ["news"],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 10
  })

  /* ------------------------------- */
  /* FEEDBACK */
  /* ------------------------------- */

  const {
    data: dataFeedbacks = [],
    isLoading: isLoadingFeedback
  } = useQuery<(Feedback & { user: User })[]>({
    queryKey: ["feedback"],
    queryFn: async () => {
      const { data: feedback } = await axios.get("/api/feedback")
      
      return feedback
    },
    staleTime: 1000 * 60 * 10
  })

  return (
    <main className="min-h-screen bg-background sm:px-10 px-0">
      <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4 py-8">
        <HeaderSection />

        {/* ------------------------------- */}
        {/* HEADER */}
        {/* ------------------------------- */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Novidades
          </h1>
          <p className="text-muted-foreground">
            Histórico de atualizações do aplicativo
          </p>
        </div>

        {/* ------------------------------- */}
        {/* COMMITS */}
        {/* ------------------------------- */}
        <div className="space-y-4">
          {isLoadingNews && (
            <p className="text-muted-foreground">
              Carregando atualizações...
            </p>
          )}

          {!isLoadingNews && dataNews.length === 0 && (
            <p className="text-muted-foreground">
              Nenhuma atualização encontrada.
            </p>
          )}

          <div className="flex flex-col space-y-6 max-h-72 overflow-y-auto scroll-container">
            {dataNews.map(commit => {
              const type = getCommitType(commit.message)

              return (
                <Card key={commit.id} className="hover:shadow-md transition">
                  <CardContent className="flex gap-4 p-5">

                    <div className="">
                      <Image
                        src={commit.avatar}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2 flex-1">

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {format(new Date(commit.date), "dd MMM yyyy", { locale: ptBR })}
                          {" • "}
                          {formatDistanceToNow(new Date(commit.date), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>

                      <p className="font-medium leading-snug">
                        {commit.message}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {commit.author}
                        </span>

                        <a
                          href={commit.url}
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Ver no GitHub
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* ------------------------------- */}
        {/* FEEDBACKS */}
        {/* ------------------------------- */}

        <div className="space-y-2 mt-10">
          <h2 className="text-2xl font-bold">
            Feedback dos usuários
          </h2>
          <p className="text-muted-foreground">
            Sugestões, bugs e melhorias enviadas pela comunidade
          </p>
        </div>

        <div className="space-y-4">
          {isLoadingFeedback && (
            <p className="text-muted-foreground">
              Carregando feedbacks...
            </p>
          )}
          <div className="flex flex-col max-h-125 overflow-y-auto scroll-container space-y-6">
            {dataFeedbacks.map(fb => {
              const status = getFeedbackStatus(fb.status)

              return (
                <Card key={fb.id} className="hover:shadow-md transition">
                  <CardContent className="p-5 flex flex-col gap-4">
                    {/* header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-2 items-center">
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>

                        <Badge variant="outline">
                          {fb.type}
                        </Badge>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(fb.createdAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                    
                    <div>
                      {fb.user.imageUrl && (
                        <div className="flex flex-row items-center gap-2">
                          <Image
                            className="rounded-full w-8 h-8"
                            width={8}
                            height={8}
                            alt="Avatar"
                            src={fb.user.imageUrl || ""}
                          />
                          <p>{fb.user.firstName}</p>
                        </div>
                      )}

                      {/* title */}
                      <h3 className="font-semibold text-lg">
                        {fb.title}
                      </h3>
                    </div>

                    {/* description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {fb.description}
                    </p>

                    {/* rating */}
                    {fb.rating && fb.rating > 0 && (
                      <div className="text-yellow-400 text-sm">
                        {"★".repeat(fb.rating)}
                      </div>
                    )}

                    {/* media */}
                    {fb.imageUrl && (
                      <Image
                        src={fb.imageUrl}
                        alt="feedback"
                        width={400}
                        height={200}
                        className="rounded-lg border"
                      />
                    )}

                    {fb.videoUrl && (
                      <a
                        href={fb.videoUrl}
                        target="_blank"
                        className="text-primary text-sm underline"
                      >
                        Ver vídeo
                      </a>
                    )}

                    {/* footer */}
                    {fb.page && (
                      <span className="text-xs text-muted-foreground">
                        Página: {fb.page}
                      </span>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}