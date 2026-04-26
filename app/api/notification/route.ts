import { NextResponse } from "next/server";
import z from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// No topo do arquivo
const formSchema = z.object({
  action: z.enum(['subscribe', 'unsubscribe']),
  subscription: z.any().optional() // subscription é um objeto
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }

    const body = await request.json()

    const parsedBody = formSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)

    const {
      action,
      subscription
    } = parsedBody.data

    if (action === "subscribe") {
      if (!subscription) throw new Error("Subscription data is required");
      
      await prisma.notification.upsert({
        where: { user_id: userDb.id }, // Ajuste para o ID correto do seu schema
        update: { notification_json: JSON.stringify(subscription) },
        create: {
          user_id: userDb.id,
          notification_json: JSON.stringify(subscription),
        },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "unsubscribe") {
      await prisma.notification.deleteMany({
        where: { user_id: userId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      error: "Invalid action"
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}