import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Busca os top 10 jogadores baseado em pontos (exemplo de lógica de ranking)
    // Aqui assumimos que seu modelo de usuário tem um campo 'points' ou similar
    const topUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        points: 'desc',
      },
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
      }
    });

    // 2. Busca a pontuação do usuário atual
    const currentUser = await prisma.user.findFirst({
      where: { clerkUserId },
      select: { points: true }
    });

    // 3. Formata os dados para o formato esperado pelo Player type do front
    const players: Player[] = topUsers.map((user, index) => ({
      id: user.id,
      name: user.name || "Jogador",
      avatar: user.image || "",
      score: user.points || 0,
      rank: index + 1,
      increment: 100, // Exemplo de incremento visual
    }));

    return NextResponse.json({
      players,
      userScore: currentUser?.points || 0
    });

  } catch (error) {
    console.error("Erro no Leaderboard:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    )
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
  
  if (action === "spin") {
    // Busca 10 hábitos ativos do usuário de forma aleatória (ou os top 10)
    const habits = await prisma.habit.findMany({
      where: {
        userId: userDb.id,
        status: "ACTIVE",
      },
      take: 10,
    });

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

    return NextResponse.json({
      reels,
      isWin,
      points,
      message
    })
  }
}