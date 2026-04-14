import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { priceId } = await req.json()
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (!user) throw new Error("User not found")

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: user.email,

    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,

    metadata: {
      userId: user.id
    }
  })

  return NextResponse.json({ url: session.url })
}