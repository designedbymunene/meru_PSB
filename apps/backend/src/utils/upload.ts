import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { getAppConfig, getUploadConfig } from './env'

// Ensure uploads directory exists
const { UPLOAD_DIR } = getAppConfig()
const uploadDir = path.isAbsolute(UPLOAD_DIR) ? UPLOAD_DIR : path.resolve(process.cwd(), UPLOAD_DIR)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Ensure vacancies directory exists
const vacanciesUploadDir = path.join(uploadDir, 'vacancies')
if (!fs.existsSync(vacanciesUploadDir)) {
    fs.mkdirSync(vacanciesUploadDir, { recursive: true })
}

// Configure multer storage for CVs
const allowedCvTypes = new Map<string, string>([
    ['application/pdf', '.pdf'],
    ['application/msword', '.doc'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx']
])

const cvStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir)
    },
    filename: (_req, _file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = allowedCvTypes.get(_file.mimetype) ?? path.extname(_file.originalname).toLowerCase()
        cb(null, `cv-${uniqueSuffix}${ext}`)
    }
})

// File filter - accept PDF, DOC, and DOCX for CVs
const cvFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (allowedCvTypes.has(file.mimetype)) {
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
        fileSize: getUploadConfig().MAX_FILE_SIZE
    }
})
