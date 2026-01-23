import { z } from "zod"

 // Max size is 5MB
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"]

export  const createAnnotationSchema = z.object({
    name: z.string(),
    completionId: z.string(),
    summary: z.string().optional(),
    files: z
      .any()
      .optional().default([]),
  })

export type CreateAnnotationSchemaType = z.infer<typeof createAnnotationSchema>