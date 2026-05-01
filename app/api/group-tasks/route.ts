import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CreateGroupTaskSchema } from "@/lib/schema/group-tasks";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: clerkId }
    });

    if (!userDb) return NextResponse.json({
      error: "User not found"
    }, { status: 404 });

    const groups = await prisma.groupTask.findMany({
      where: {
        userId: userDb.id
      },
      include: {
        _count: {
          select: { tasks: true } // Retorna a quantidade de tasks em cada grupo
        },
        tasks: {
          take: 5, // Opcional: Retorna um preview das primeiras 5 tasks
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("🔥 GROUP_TASKS_GET_ERROR:", error);
    return NextResponse.json({ message: "Erro ao buscar grupos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = CreateGroupTaskSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({
        error: parsedBody.error.message
      }, { status: 400 });
    }

    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: clerkId
      }
    })
    if (!userDb) return NextResponse.json({
      error: "User not found"
    }, { status: 401 });

    const {
      name,
      description,
      tasks,
      color
    } = parsedBody.data;

    // ✅ Cria o Grupo com os relacionamentos de Task
    const newGroup = await prisma.groupTask.create({
      data: {
        name,
        color,
        description: description || "",
        userId: userDb.id,
        tasks: {
          connect: tasks?.map((id: string) => ({ id })) || [],
        },
      },
      include: { tasks: true }
    });

    // 🔥 BUSCA DADOS ATUALIZADOS PARA O WIZARD/FEEDBACK
    const [totalGroups, groups] = await Promise.all([
      prisma.groupTask.count({ where: { userId: userDb.id } }),
      prisma.groupTask.findMany({
        where: { userId: userDb.id },
        take: 3,
        orderBy: { id: "desc" },
        include: { _count: { select: { tasks: true } } }
      })
    ]);

    const groupsPreview = groups.map((g) => ({
      name: g.name,
      taskCount: g._count.tasks,
      color: "#8B5CF6", // Violeta padrão para grupos
    }));

    return NextResponse.json({
      totalGroups,
      groupsPreview,
      newGroup
    });

  } catch (error: any) {
    console.error("🔥 GROUP_TASK_POST_ERROR:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ 
        message: "Você já possui um grupo com este nome." 
      }, { status: 409 });
    }
    return NextResponse.json({
      message: "Erro interno"
    }, { status: 500 });
  }
}