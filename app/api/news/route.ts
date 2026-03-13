import { NextResponse } from "next/server"

export async function GET() {

  const owner = "omanramalho42"
  const repo = "habits-tracker"

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
    {
      headers: {
        Accept: "application/vnd.github+json"
      },
      next: { revalidate: 60 }
    }
  )

  if (!res.ok) {
    return NextResponse.json(
      { error: "Erro ao buscar commits" },
      { status: 500 }
    )
  }

  const data = await res.json()

  const commits = data.map((commit: any) => ({
    id: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author.name,
    avatar: commit.author?.avatar_url,
    date: commit.commit.author.date,
    url: commit.html_url
  }))

  return NextResponse.json(commits)
}