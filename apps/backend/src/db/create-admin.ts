import { db } from './index'
import { users } from './schema'
import bcrypt from 'bcryptjs'
import { eq, or } from 'drizzle-orm'

async function createAdmin() {
    const email = process.argv[2]
    const phoneNumber = process.argv[3]
    const firstName = process.argv[4]
    const lastName = process.argv[5]
    const password = process.argv[6]

    if (!email || !phoneNumber || !firstName || !lastName || !password) {
        console.log('\n🚀 Meru County Recruitment Portal - Admin Creator')
        console.log('--------------------------------------------------')
        console.log('Usage: pnpm db:create-admin <email> <phoneNumber> <firstName> <lastName> <password>')
        console.log('\nExample:')
        console.log('  pnpm db:create-admin "admin2@example.com" "0711223344" "Jane" "Doe" "password123"')
        console.log('--------------------------------------------------\n')
        process.exit(1)
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    try {
        console.log(`🔍 Checking if user with email ${email} or phone ${phoneNumber} exists...`)
        
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: or(
                eq(users.email, email.toLowerCase()),
                eq(users.phoneNumber, phoneNumber)
            )
        })

        if (existingUser) {
            console.error(`❌ Error: User with email ${email} or phone ${phoneNumber} already exists.`)
            process.exit(1)
        }

        console.log(`🔐 Hashing password...`)
        const hashedPassword = await bcrypt.hash(password, 10)

        console.log(`📝 Creating admin user ${fullName}...`)
        await db.insert(users).values({
            email: email.toLowerCase(),
            phoneNumber,
            fullName,
            password: hashedPassword,
            role: 'admin'
        })

        console.log(`✅ Admin user ${email} created successfully!`)
    } catch (error) {
        console.error('❌ Error creating admin user:', error)
        process.exit(1)
    } finally {
        process.exit(0)
    }
}

createAdmin().catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
})
