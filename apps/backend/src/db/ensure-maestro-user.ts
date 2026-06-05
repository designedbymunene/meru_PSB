import { db } from './index'
import { users } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function ensureUser() {
  const email = 'test.applicant1@example.com'
  const password = 'user@123456'
  
  console.log(`Checking for test user: ${email}...`)
  
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  })
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  if (existing) {
    console.log('User exists, updating password...')
    await db.update(users)
      .set({ password: hashedPassword, fullName: 'Maestro Test User', role: 'applicant' })
      .where(eq(users.email, email))
  } else {
    console.log('User does not exist, creating...')
    await db.insert(users).values({
      email,
      password: hashedPassword,
      fullName: 'Maestro Test User',
      phoneNumber: '0711000001',
      role: 'applicant'
    })
  }
  
  console.log('✅ Maestro test user is ready.')
  process.exit(0)
}

ensureUser().catch(err => {
  console.error('❌ Error ensuring maestro user:', err)
  process.exit(1)
})
