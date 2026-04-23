import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { formatToBrazilDay } from "@/lib/utils"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    })

    if (!userDb) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const [habitCompletions, taskCompletions] = await Promise.all([
      prisma.habitCompletion.findMany({
        where: { habit: { userId: userDb.id } },
        select: { completedDate: true }
      }),
      prisma.taskCompletion.findMany({
        where: { task: { userId: userDb.id }, isCompleted: true },
        select: { completedDate: true }
      })
    ])
    const dailyCompletions = new Map<string, boolean>();

    [...habitCompletions, ...taskCompletions].forEach(item => {
      const dateStr = formatToBrazilDay(item.completedDate!);
      dailyCompletions.set(dateStr, true);
    });
    // Normaliza para strings YYYY-MM-DD usando sua função da lib
    const allCompletedDates = new Set([
      ...habitCompletions.map(c => formatToBrazilDay(c.completedDate!)),
      ...taskCompletions.map(c => formatToBrazilDay(c.completedDate!))
    ]);

    const datesArray: Date[] = Array.from(allCompletedDates)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());
    // Adicione isto para transformar o Set em um array de strings formatadas
    const completedDatesList = Array.from(allCompletedDates);
    // Cálculo de Streak
    function calculateStreak(dates: Date[]) {
      if (!dates.length) return { current: 0, longest: 0, startDate: null };

      let current = 0;
      let longest = 0;
      
      // Ordenar datas para garantir processamento correto
      const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Verifica se o streak atual é válido (se completou hoje ou ontem)
      const lastDate = sortedDates[sortedDates.length - 1];
      const lastDateStr = formatToBrazilDay(lastDate);
      const todayStr = formatToBrazilDay(today);
      const yesterdayStr = formatToBrazilDay(yesterday);

      // Se a última conclusão foi antes de ontem, o streak atual é 0
      if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
        current = 0;
      } else {
        // Conta retroativamente a partir de hoje/ontem
        current = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const curr = new Date(formatToBrazilDay(sortedDates[i+1])).getTime();
          const prev = new Date(formatToBrazilDay(sortedDates[i])).getTime();
          if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
            current++;
          } else {
            break;
          }
        }
      }

      // Cálculo do Longest Streak (padrão)
      let tempLongest = 1;
      longest = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const diff = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempLongest++;
          longest = Math.max(longest, tempLongest);
        } else if (diff > 1) {
          tempLongest = 1;
        }
      }

      return { current, longest, startDate: sortedDates[0] };
    }

    const { current, longest, startDate } = calculateStreak(datesArray);

    // Lógica da Semana
    const today = new Date();
    const todayStr = formatToBrazilDay(today);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // 2. Atualizar o currentWeek com a contagem real de dias concluídos
    const currentWeek = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatToBrazilDay(date);
      
      return {
        day: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"][i],
        completed: dailyCompletions.has(dateStr), // Verifica se o mapa tem o dia
        isFuture: date.getTime() > today.getTime(),
        highlighted: dateStr === todayStr
      };
    });
    // 3. Dias concluídos na semana (O dado que você solicitou)
    const daysCompletedCount = currentWeek.filter(d => d.completed).length;
    // Progresso semanal (0 a 100% da semana atual)
    const daysCompletedThisWeek = currentWeek.filter(d => d.completed).length;
    const weeklyProgress = (daysCompletedThisWeek / 7) * 100;

    // Milestones (mantendo sua lógica original para o resto do app)
    const milestones = [7, 14, 30, 60, 100, 180, 365];
    let currentMilestone = 0;
    let nextMilestone = milestones[0];

    for (let i = 0; i < milestones.length; i++) {
      if (current >= milestones[i]) {
        currentMilestone = milestones[i];
        nextMilestone = milestones[i + 1] || milestones[i];
      }
    }

    const daysToNextMilestone = Math.max(nextMilestone - current, 0);
    const progress = Math.round((daysCompletedThisWeek / 7) * 100);
    return NextResponse.json({
      currentStreak: current,
      maxStreak: longest,
      startedAt: startDate,
      weekDays: currentWeek,
      currentMilestone,
      nextMilestone,
      daysToNextMilestone,
      completedDates: completedDatesList, // <--- NOVO ATRIBUTO
      daysCompletedThisWeek: daysCompletedCount, // <--- O dado que você queria
      progress: Math.round(progress),
      weeklyProgress: Math.round(weeklyProgress) // Novo campo para o front
    })

  } catch (error) {
    console.error("🔥 streak error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}