import { z } from 'zod'

export const createAccessRequestSchema = z.object({
  cardUid: z.string().trim().min(1),
  direction: z.enum(['ENTRY', 'EXIT']),
  source: z.enum([
    'WEB_SIMULATOR',
    'EDGE_SIMULATOR',
    'RASPBERRY_PI',
    'PHYSICAL_READER',
  ]),
  deviceId: z.string().trim().min(1),
  locationId: z.string().trim().min(1),
})

export type CreateAccessRequest = z.infer<
  typeof createAccessRequestSchema
>