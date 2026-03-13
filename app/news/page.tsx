"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchNews } from "@/services/news"

import {
  Card,
  CardContent
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import HeaderSection from "@/components/habits/header-section"
import Footer from "@/components/habits/footer"

interface Commit {
  id: string
  message: string
  author: string
  avatar: string
  date: string
  url: string
}

/* ------------------------------- */
/* detectar tipo do commit */
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

export default function NewsPage() {

  const { data = [], isLoading } = useQuery<Commit[]>({
    queryKey: ["news"],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 10
  })

  return (

    <main className="min-h-screen bg-background">

      <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-8">

        <HeaderSection />

        {/* header */}

        <div className="space-y-2">

          <h1 className="text-3xl font-bold">
            Novidades
          </h1>

          <p className="text-muted-foreground">
            Histórico de atualizações do aplicativo
          </p>

        </div>

        {/* commits */}

        <div className="space-y-4">

          {isLoading && (
            <p className="text-muted-foreground">
              Carregando atualizações...
            </p>
          )}

          {!isLoading && data.length === 0 && (
            <p className="text-muted-foreground">
              Nenhuma atualização encontrada.
            </p>
          )}

          {data.map(commit => {

            const type = getCommitType(commit.message)

            return (

              <Card
                key={commit.id}
                className="hover:shadow-md transition"
              >

                <CardContent className="flex gap-4 p-5">

                  {/* avatar */}

                  <img
                    src={commit.avatar}
                    className="w-10 h-10 rounded-full"
                  />

                  <div className="flex flex-col gap-2 flex-1">

                    {/* top row */}

                    <div className="flex items-center gap-2 flex-wrap">

                      <Badge
                        className={`${type.color} text-white`}
                      >
                        {type.label}
                      </Badge>

                      <span className="text-xs text-muted-foreground">

                        {format(
                          new Date(commit.date),
                          "dd MMM yyyy",
                          { locale: ptBR }
                        )}

                        {" • "}

                        {formatDistanceToNow(
                          new Date(commit.date),
                          {
                            addSuffix: true,
                            locale: ptBR
                          }
                        )}

                      </span>

                    </div>

                    {/* mensagem */}

                    <p className="font-medium leading-snug">

                      {commit.message}

                    </p>

                    {/* footer */}

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

        <Footer />

      </div>

    </main>
  )
}