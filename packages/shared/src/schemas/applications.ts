import { z } from 'zod'

// Application creation schema
export const createApplicationSchema = z.object({
    vacancyId: z.number({ required_error: 'Vacancy is required', invalid_type_error: 'Please select a valid vacancy' }).int().positive('Please select a valid vacancy')
})

// Application status update schema
export const updateApplicationStatusSchema = z.object({
    status: z.enum(['pending', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'accepted', 'rejected']),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    rejectionReason: z.string().optional()
})

// Application review filters schema
export const applicationFiltersSchema = z.object({
    status: z.enum(['pending', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'accepted', 'rejected']).optional(),
    vacancyId: z.string().optional(),
    departmentId: z.string().optional(),
    jobGroupId: z.string().optional(),
    applicantId: z.string().optional(),
    searchTerm: z.string().optional(),
    sortBy: z.enum(['appliedAt', 'reviewedAt']).optional().default('appliedAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.string().optional().default('50'),
    offset: z.string().optional().default('0')
})

// Bulk status update schema
export const bulkApplicationStatusSchema = z.object({
    applicationIds: z.array(z.number({ required_error: 'Application ID is required', invalid_type_error: 'Invalid application ID' }).int().positive()).min(1, 'Please select at least one application'),
    status: z.enum(['pending', 'reviewed', 'shortlisted', 'interviewing', 'interviewed', 'accepted', 'rejected']),
    notes: z.string().optional()
})

// Application review schema
export const applicationReviewSchema = z.object({
    status: z.enum(['reviewed', 'shortlisted', 'interviewing', 'interviewed', 'accepted', 'rejected']),
    notes: z.string().min(1),
    tags: z.array(z.string()).optional(),
    rating: z.number({ required_error: 'Please provide a rating', invalid_type_error: 'Please provide a valid rating number' }).int().min(1).max(5).optional(),
    rejectionReason: z.string().optional(),
    feedbackToApplicant: z.string().optional()
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>
export type ApplicationFiltersInput = z.infer<typeof applicationFiltersSchema>
export type BulkApplicationStatusInput = z.infer<typeof bulkApplicationStatusSchema>
export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>
