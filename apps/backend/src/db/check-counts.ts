import { db, vacancies } from './index'
import { eq } from 'drizzle-orm'

async function checkVacancies() {
    const allVacancies = await db.select().from(vacancies)
    console.log('Total vacancies:', allVacancies.length)
    allVacancies.forEach(v => {
        console.log(`ID: ${v.id}, Title: ${v.title}, Status: ${v.status}, Closing Date: ${v.closingDate}`)
    })
}

checkVacancies().catch(console.error)
