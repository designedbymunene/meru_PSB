import { z } from 'zod'

export const createVenueSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    location: z.string().optional(),
    tagIds: z.array(z.number()).default([])
})

export const updateVenueSchema = createVenueSchema.partial()

export type CreateVenueInput = z.infer<typeof createVenueSchema>
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>
