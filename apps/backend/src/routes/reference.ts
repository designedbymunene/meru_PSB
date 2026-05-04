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

export const referenceRouter = new Hono()

// --- Locations ---

// Get all counties
referenceRouter.get('/locations/counties', async (c) => {
    const data = await db.query.counties.findMany({
        orderBy: [asc(counties.name)]
    })
    return c.json({ success: true, data })
})

// Get constituencies by county
referenceRouter.get('/locations/constituencies', async (c) => {
    const countyId = c.req.query('countyId')
    if (!countyId) {
        return c.json({ success: false, message: 'countyId is required' }, 400)
    }
    const data = await db.query.constituencies.findMany({
        where: eq(constituencies.countyId, parseInt(countyId)),
        orderBy: [asc(constituencies.name)]
    })
    return c.json({ success: true, data })
})

// Get wards by constituency
referenceRouter.get('/locations/wards', async (c) => {
    const constituencyId = c.req.query('constituencyId')
    if (!constituencyId) {
        return c.json({ success: false, message: 'constituencyId is required' }, 400)
    }
    const data = await db.query.wards.findMany({
        where: eq(wards.constituencyId, parseInt(constituencyId)),
        orderBy: [asc(wards.name)]
    })
    return c.json({ success: true, data })
})

// --- Education ---

// Get education levels
referenceRouter.get('/education/levels', async (c) => {
    const data = await db.query.educationLevels.findMany({
        orderBy: [asc(educationLevels.id)]
    })
    return c.json({ success: true, data })
})

// Get grades for a level
referenceRouter.get('/education/grades', async (c) => {
    const levelId = c.req.query('levelId')
    if (!levelId) {
        return c.json({ success: false, message: 'levelId is required' }, 400)
    }
    const data = await db.query.educationGrades.findMany({
        where: eq(educationGrades.levelId, parseInt(levelId)),
        orderBy: [asc(educationGrades.grade)]
    })
    return c.json({ success: true, data })
})

// Get institutions
referenceRouter.get('/institutions', async (c) => {
    const data = await db.query.institutions.findMany({
        orderBy: [asc(institutions.name)]
    })
    return c.json({ success: true, data })
})

// Get courses
referenceRouter.get('/courses', async (c) => {
    const data = await db.query.courses.findMany({
        orderBy: [asc(courses.name)]
    })
    return c.json({ success: true, data })
})

// --- Other ---

// Get ethnicities
referenceRouter.get('/ethnicities', async (c) => {
    const data = await db.query.ethnicities.findMany({
        orderBy: [asc(ethnicities.name)]
    })
    return c.json({ success: true, data })
})

// Get professional bodies
referenceRouter.get('/professional-bodies', async (c) => {
    const data = await db.query.professionalBodies.findMany({
        orderBy: [asc(professionalBodies.name)]
    })
    return c.json({ success: true, data })
})
