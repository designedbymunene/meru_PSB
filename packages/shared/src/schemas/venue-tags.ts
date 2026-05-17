import { z } from 'zod'

export const createVenueTagSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    color: z.string().default('blue')
})

export const updateVenueTagSchema = createVenueTagSchema.partial()

export type CreateVenueTagInput = z.infer<typeof createVenueTagSchema>
export type UpdateVenueTagInput = z.infer<typeof updateVenueTagSchema>
