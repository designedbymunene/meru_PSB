import { Hono } from 'hono'
import { db } from '../db'
import { 
    counties, 
    constituencies, 
    wards, 
    ethnicities, 
    educationLevels, 
    educationGrades, 
    institutions, 
    courses, 
    professionalBodies 
} from '../db/schema'
import { eq, asc } from 'drizzle-orm'
import { safeParseInt } from '../utils/safe-parse'
import { successResponse } from '../utils/errors'
import { publicRateLimiter } from '../middleware/rateLimiter'

export const referenceRouter = new Hono()

referenceRouter.use('*', publicRateLimiter)

// --- Locations ---

// Get all counties
referenceRouter.get('/locations/counties', async (c) => {
    const data = await db.query.counties.findMany({
        orderBy: [asc(counties.name)]
    })
    return successResponse(c, data)
})

// Get constituencies by county
referenceRouter.get('/locations/constituencies', async (c) => {
    const countyId = c.req.query('countyId')
    const parsedCountyId = safeParseInt(countyId, 'countyId')
    
    const data = await db.query.constituencies.findMany({
        where: eq(constituencies.countyId, parsedCountyId),
        orderBy: [asc(constituencies.name)]
    })
    return successResponse(c, data)
})

// Get wards by constituency
referenceRouter.get('/locations/wards', async (c) => {
    const constituencyId = c.req.query('constituencyId')
    const parsedConstituencyId = safeParseInt(constituencyId, 'constituencyId')
    
    const data = await db.query.wards.findMany({
        where: eq(wards.constituencyId, parsedConstituencyId),
        orderBy: [asc(wards.name)]
    })
    return successResponse(c, data)
})

// --- Education ---

// Get education levels
referenceRouter.get('/education/levels', async (c) => {
    const data = await db.query.educationLevels.findMany({
        orderBy: [asc(educationLevels.id)]
    })
    return successResponse(c, data)
})

// Get grades for a level
referenceRouter.get('/education/grades', async (c) => {
    const levelId = c.req.query('levelId')
    const parsedLevelId = safeParseInt(levelId, 'levelId')
    
    const data = await db.query.educationGrades.findMany({
        where: eq(educationGrades.levelId, parsedLevelId),
        orderBy: [asc(educationGrades.grade)]
    })
    return successResponse(c, data)
})

// Get institutions
referenceRouter.get('/institutions', async (c) => {
    const data = await db.query.institutions.findMany({
        orderBy: [asc(institutions.name)]
    })
    return successResponse(c, data)
})

// Get courses
referenceRouter.get('/courses', async (c) => {
    const data = await db.query.courses.findMany({
        orderBy: [asc(courses.name)]
    })
    return successResponse(c, data)
})

// --- Other ---

// Get ethnicities
referenceRouter.get('/ethnicities', async (c) => {
    const data = await db.query.ethnicities.findMany({
        orderBy: [asc(ethnicities.name)]
    })
    return successResponse(c, data)
})

// Get professional bodies
referenceRouter.get('/professional-bodies', async (c) => {
    const data = await db.query.professionalBodies.findMany({
        orderBy: [asc(professionalBodies.name)]
    })
    return successResponse(c, data)
})


