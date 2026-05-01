// api/group-tasks/[id]/route.ts
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UpdateGroupTaskSchema } from "@/lib/schema/group-tasks";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

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

    const groupWithTasks = await prisma.groupTask.findUnique({
      where: {
        id,
        userId: userDb.id // Garantia extra de que o grupo pertence ao usuário
      },
      include: {
        tasks: {
          where: {
            deletedAt: null // Se você usar soft delete
          },
          orderBy: {
            indexPos: 'asc'
          },
          include: {
            completions: true, // Útil para mostrar status de check na UI
            categories: true
          }
        }
      }
    });

    if (!groupWithTasks) {
      return NextResponse.json({
        error: "Grupo não encontrado"
      }, { status: 404 });
    }

    return NextResponse.json(groupWithTasks);
  } catch (error) {
    console.error("🔥 GROUP_ID_GET_ERROR:", error);
    return NextResponse.json({
      message: "Erro ao buscar tarefas do grupo"
    }, { status: 500 });
  }
}

// UPDATE (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });

    const body = await request.json();
    const parsedBody = UpdateGroupTaskSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({
        error: parsedBody.error.message
      }, { status: 400 });
    }

    const {
      name,
      description,
      tasks,
      color
    } = parsedBody.data;
    const { id: groupId } = await params

    const existingGroup = await prisma.groupTask.findFirst({
      where: { id: groupId }
    });

    if (!existingGroup) {
      return NextResponse.json({
        error: "Grupo não encontrado ou acesso negado"
      }, { status: 404 });
    }

    const updatedGroup = await prisma.groupTask.update({
      where: {
        id: groupId
      },
      data: {
        name,
        description,
        color,
        tasks: {
          set: tasks?.map((id: string) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("🔥 GROUP_TASK_PATCH_ERROR:", error);
    return NextResponse.json({ message: "Erro ao atualizar grupo" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.groupTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 GROUP_TASK_DELETE_ERROR:", error);
    return NextResponse.json({ message: "Erro ao excluir grupo" }, { status: 500 });
  }
}