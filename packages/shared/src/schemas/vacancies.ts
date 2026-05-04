import { z } from 'zod'

// Department creation schema
export const createDepartmentSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional().default('active')
})

// Department update schema
export const updateDepartmentSchema = createDepartmentSchema.partial()

// Job Group creation schema
export const createJobGroupSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    salaryMin: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid salary format'),
    salaryMax: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid salary format'),
    status: z.enum(['active', 'inactive']).optional().default('active')
})

// Job Group update schema
export const updateJobGroupSchema = createJobGroupSchema.partial()

// Vacancy creation schema
export const createVacancySchema = z.object({
    advertisementNumber: z.string().min(1).max(100).optional(),
    title: z.string().min(1).max(200),
    description: z.string().min(10),
    departmentId: z.number().int().positive(),
    jobGroupId: z.number().int().positive(),
    closingDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO datetime or YYYY-MM-DD
    openPositions: z.number().int().positive().optional().default(1),
    jobRequirements: z.array(z.string().min(1)).optional().default([]),
    jobResponsibilities: z.array(z.string().min(1)).optional().default([]),
    status: z.enum(['open', 'closed']).optional().default('open')
})

// Vacancy update schema
export const updateVacancySchema = createVacancySchema.partial()

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>
export type CreateJobGroupInput = z.infer<typeof createJobGroupSchema>
export type UpdateJobGroupInput = z.infer<typeof updateJobGroupSchema>
export type CreateVacancyInput = z.infer<typeof createVacancySchema>
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>
