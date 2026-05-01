import z from "zod"

export const CreateGroupTaskSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().max(10).optional(),
  tasks: z.array(z.string()).optional(), // Array de tarefas
})

export type CreateGroupTaskSchemaType = z.infer<typeof CreateGroupTaskSchema>

export const UpdateGroupTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().max(10).optional(),
  tasks: z.array(z.string()).optional(), // Array de tarefas
})

export type UpdateGroupTaskSchemaType = z.infer<typeof UpdateGroupTaskSchema>
