import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { inngest } from "@/inngest/client"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env")
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occurred", {
      status: 400,
    })
  }

  if(evt.type === 'user.created') {
    const { id, email_addresses, first_name, image_url } = evt.data
    try {
      const newUser = await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          // lastName: last_name,
          imageUrl: image_url,
        }
      });
        await inngest.send({
        name: 'app/user.created',
        data: {
          email: email_addresses[0].email_address,
          name: first_name,
          // country,
          // investmentGoals,
          // riskTolerance,
          // preferredIndustry
        }
      })
      return new Response(JSON.stringify(newUser), {
        status: 201,
      })
    } catch(error) {
      console.error('Error: Failed to store event in the database:', error)
      return new Response('Error: Failed to store event in the database', {
        status: 500,
      });
    }
  }
}
