import { z } from 'zod'

export const faceVerificationSchema = z.discriminatedUnion(
  'provider',
  [
    z.object({
      provider: z.literal('MOCK'),
      mockIdentityId: z.string().trim().min(1),
    }),
    z.object({
      provider: z.literal('REKOGNITION'),
      imageBase64: z.string().min(1),
    }),
    z.object({
      provider: z.literal('LOCAL'),
      imageBase64: z.string().min(1),
    }),
  ],
)

export type FaceVerification = z.infer<
  typeof faceVerificationSchema
>