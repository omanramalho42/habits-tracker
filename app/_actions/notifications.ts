"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import webpush from "web-push"

export const sendNotification = async (
  message: string,
  icon: string,
  name: string
) => {
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

  const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
    privateKey: process.env.VAPID_SECRET_KEY!,
  };

  webpush.setVapidDetails(
    "mailto:contato@habits.app.br",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  try {
    // Buscando o registro com Prisma
    const notificationData = await prisma.notification.findFirst({
      where: {
        user_id: userDb.id,
      },
    });

    if (!notificationData) {
      return JSON.stringify({
        error: "Notification subscription not found"
      });
    }

    // Enviando via web-push
    await webpush.sendNotification(
      JSON.parse(notificationData.notification_json),
      JSON.stringify({
        message: name,
        icon,
        body: message,
      })
    );
    console.log("webpush enviado com sucesso", notificationData, "notification data")
    return "{}";
  } catch (e) {
    console.error("Erro ao enviar notificação:", e);
    return JSON.stringify({ error: "failed to send notification" });
  }
};