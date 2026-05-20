import { db } from './index'
import { 
    professionalDetails, 
    professionalMemberships, 
    trainingCourses, 
    referees, 
    applications 
} from './schema'
import { eq } from 'drizzle-orm'

async function checkCounts() {
    const pd = await db.select().from(professionalDetails)
    const pm = await db.select().from(professionalMemberships)
    const tc = await db.select().from(trainingCourses)
    const ref = await db.select().from(referees)
    const shortlisted = await db.select().from(applications).where(eq(applications.status, 'shortlisted'))

    console.log({
        professionalDetails: pd.length,
        professionalMemberships: pm.length,
        trainingCourses: tc.length,
        referees: ref.length,
        shortlisted: shortlisted.length
    })
}

checkCounts().catch(console.error)
