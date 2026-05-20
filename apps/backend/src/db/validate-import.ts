import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const client = await pool.connect()

    try {
        console.log('🧪 Validating Import...')
        
        const counts = await client.query(`
            SELECT 
                (SELECT count(*) FROM users) as users_count,
                (SELECT count(*) FROM applicant_profiles) as profiles_count,
                (SELECT count(*) FROM qualifications) as qualifications_count,
                (SELECT count(*) FROM employment_history) as employment_count
        `)
        console.log('📊 Records in database:', counts.rows[0])

        const sampleProfile = await client.query(`
            SELECT p.full_name, p.id_number, u.email,
                   (SELECT count(*) FROM qualifications q WHERE q.applicant_profile_id = p.id) as q_count,
                   (SELECT count(*) FROM employment_history e WHERE e.applicant_profile_id = p.id) as e_count
            FROM applicant_profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.full_name IS NOT NULL
            LIMIT 5
        `)
        
        console.log('👤 Sample Profiles with related data counts:')
        sampleProfile.rows.forEach(r => console.log(`   - ${r.full_name} (${r.email}): ${r.q_count} qual, ${r.e_count} exp`))

    } catch (error) {
        console.error('❌ Validation failed:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

main().catch(console.error)
