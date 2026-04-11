import { NextResponse } from "next/server"

export interface Conversation {
  id: string
  title: string
  description: string
  duration: string
  timestamp: string
  date: string
  tags: string[]
  transcription?: string
}

// In-memory storage for demo
let conversations: Conversation[] = [
  {
    id: "1",
    title: "Cognition Acquires Windsurf, Tests",
    description: "The conversation includes user testing of an app's speech transcription feature, focusing on",
    duration: "7m 22s",
    timestamp: "Jul 14, 9:27 PM",
    date: "Today",
    tags: ["Technology"],
  },
  {
    id: "2",
    title: "Test Conversation and Transcription",
    description: "A brief conversation focused on transcription quality. The speaker",
    duration: "11s",
    timestamp: "Jul 14, 9:26 PM",
    date: "Today",
    tags: ["Technology"],
  },
  {
    id: "3",
    title: "Monthly Priority Planning",
    description: "Discussion about prioritizing tasks and goals for this month",
    duration: "23m 45s",
    timestamp: "Jul 13, 3:15 PM",
    date: "Yesterday",
    tags: ["Planning", "Work"],
  },
  {
    id: "4",
    title: "Product Roadmap Review",
    description: "Reviewing the Q3 product roadmap and feature priorities",
    duration: "45m 12s",
    timestamp: "Jul 12, 10:00 AM",
    date: "Jul 12",
    tags: ["Product", "Meeting"],
  },
]

export async function GET() {
  return NextResponse.json(conversations)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newConversation: Conversation = {
    id: Date.now().toString(),
    title: body.title || "New Conversation",
    description: body.description || "",
    duration: body.duration || "0s",
    timestamp: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    date: "Today",
    tags: body.tags || [],
    transcription: body.transcription,
  }
  
  conversations = [newConversation, ...conversations]
  
  return NextResponse.json(newConversation, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body
  
  conversations = conversations.map((conv) =>
    conv.id === id ? { ...conv, ...updates } : conv
  )
  
  const updated = conversations.find((conv) => conv.id === id)
  
  if (!updated) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }
  
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }
  
  conversations = conversations.filter((conv) => conv.id !== id)
  
  return NextResponse.json({ success: true })
}
