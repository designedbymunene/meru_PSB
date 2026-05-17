import { z } from 'zod'

// --- DOWNLOAD CATEGORY SCHEMAS ---

export const downloadCategorySchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().default('FileText'),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

export const createDownloadCategorySchema = downloadCategorySchema.partial({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export const updateDownloadCategorySchema = downloadCategorySchema.partial({
    id: true,
    createdAt: true,
    updatedAt: true,
}).required({
    id: true,
})

export type DownloadCategory = z.infer<typeof downloadCategorySchema>
export type CreateDownloadCategoryInput = z.infer<typeof createDownloadCategorySchema>
export type UpdateDownloadCategoryInput = z.infer<typeof updateDownloadCategorySchema>

// --- DOWNLOAD FILE SCHEMAS ---

export const downloadFileSchema = z.object({
    id: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    name: z.string().min(1, "File name is required"),
    description: z.string().min(1, "Description is required"),
    url: z.string().url("Valid URL is required"),
    fileSize: z.string().default('PDF'),
    updatedDate: z.string().default(''),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
    downloadCount: z.number().default(0),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

export const createDownloadFileSchema = downloadFileSchema.partial({
    id: true,
    downloadCount: true,
    createdAt: true,
    updatedAt: true,
})

export const updateDownloadFileSchema = downloadFileSchema.partial({
    id: true,
    downloadCount: true,
    createdAt: true,
    updatedAt: true,
}).required({
    id: true,
})

export type DownloadFile = z.infer<typeof downloadFileSchema>
export type CreateDownloadFileInput = z.infer<typeof createDownloadFileSchema>
export type UpdateDownloadFileInput = z.infer<typeof updateDownloadFileSchema>
