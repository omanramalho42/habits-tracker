import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export type Player = {
  id: string
  name: string
  avatar: string
  score: number
  rank: number
  increment: number
}

export type GameResult = {
  reels: number[][]
  isWin: boolean
  points: number
  message: string
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }
    
  const userDb = await prisma.user.findFirst({
    where: {
      clerkUserId: userId
    }
  })
  
  if (!userDb) {
    return NextResponse.json({
      error: "user not found"
    }, { status: 401 })
  }

  const data = await request.json();
  const { action } = data;
  
  console.log(action, "action")

  if (action === "spin") {
    // Busca 10 hábitos ativos do usuário de forma aleatória (ou os top 10)
    const habits = await prisma.habit.findMany({
      where: {
        userId: userDb.id,
        status: "ACTIVE",
      },
      take: 10,
    });


    console.log(habits, "Habits")
    // MENSAGEM CLARA AQUI
    if (habits.length < 10) {
      return NextResponse.json(
        { error: `Você precisa de 10 hábitos ativos para jogar. (Atuais: ${habits.length})` }, 
        { status: 400 }
      );
    }
    const numHabits = habits.length;
    
    // Gera os índices das roletas (0 a 9)
    const reels: number[][] = [
      [Math.floor(Math.random() * numHabits), Math.floor(Math.random() * numHabits), Math.floor(Math.random() * numHabits)],
      [Math.floor(Math.random() * numHabits), Math.floor(Math.random() * numHabits), Math.floor(Math.random() * numHabits)],
      [Math.floor(Math.random() * numHabits), Math.floor(Math.random() * numHabits), Math.floor(Math.random() * numHabits)],
    ];

    const middleRow = [reels[0][1], reels[1][1], reels[2][1]];
    const isWin = middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2];
    
    let points = 0;
    let message = "TENTE NOVAMENTE";

    if (isWin) {
      const matchedHabit = habits[middleRow[0]];
      // Lógica de pontos: baseada no nome ou alguma métrica do hábito
      points = 100; 
      message = `JACKPOT DE ${matchedHabit.name.toUpperCase()}!`;
      // Aqui você salvaria o score no banco de dados do usuário
    }

    return NextResponse.json({ reels, isWin, points, message });
  }
}