import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkCounts() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
        const users = await client.query('SELECT count(*) FROM public.users');
        const profiles = await client.query('SELECT count(*) FROM public.applicant_profiles');
        console.log('--- Database Verification ---');
        console.log(`Users: ${users.rows[0].count}`);
        console.log(`Profiles: ${profiles.rows[0].count}`);
    } finally {
        client.release();
        await pool.end();
    }
}

checkCounts().catch(console.error);
