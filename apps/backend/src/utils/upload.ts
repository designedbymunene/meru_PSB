import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Ensure vacancies directory exists
const vacanciesUploadDir = path.join(uploadDir, 'vacancies')
if (!fs.existsSync(vacanciesUploadDir)) {
    fs.mkdirSync(vacanciesUploadDir, { recursive: true })
}

// Configure multer storage for CVs
const cvStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir)
    },
    filename: (_req, _file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(_file.originalname)
        cb(null, `cv-${uniqueSuffix}${ext}`)
    }
})

// File filter - accept PDF, DOC, and DOCX for CVs
const cvFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'))
    }
}

// Configure multer for CV uploads
export const uploadCV = multer({
    storage: cvStorage,
    fileFilter: cvFileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
    }
})
