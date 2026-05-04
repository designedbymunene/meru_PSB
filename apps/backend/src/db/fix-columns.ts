import { db } from './index'
import { sql } from 'drizzle-orm'

async function fix() {
    try {
        console.log('🔧 Dropping columns with type mismatch...')
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS home_county_id CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS home_sub_county_id CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS ward_id CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS home_county CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS home_sub_county CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS ward CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS ethnicity CASCADE`)
        await db.execute(sql`ALTER TABLE applicant_profiles DROP COLUMN IF EXISTS ethnicity_id CASCADE`)
        console.log('✅ Columns dropped.')
    } catch (e) {
        console.error(e)
    }
}

fix().then(() => process.exit(0))
