import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response("Webhook Error", { status: 400 })
  }

  // 🔥 PAGAMENTO CONFIRMADO
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    if (!userId) return new Response("No userId", {
      status: 400
    })
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) return new Response("No userId", {
      status: 400
    })

    // ✅ BUSCAR LINE ITEMS CORRETAMENTE
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const priceId = lineItems.data[0]?.price?.id

    // 🔥 MAPEAMENTO DE PLANOS
    let role: "STARTER" | "PREMIUM" = "STARTER"

    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      role = "PREMIUM"
    }

    await prisma.user.update({
      where: {
        id: userDb.id
      },
      data: {
        role,
        stripeCustomerId: session.customer as string
      }
    })
  }

  return new Response("ok")
}