import { test } from 'node:test'
import assert from 'node:assert'
import { registerSchema } from '@meru/shared'

test('Registration schema accepts split names', () => {
    const parsed = registerSchema.parse({
        email: 'john@example.com',
        phoneNumber: '+254712345678',
        password: 'SecurePassword123',
        firstName: 'John',
        lastName: 'Doe',
        nationalId: '12345678'
    })

    assert.strictEqual(parsed.firstName, 'John')
    assert.strictEqual(parsed.lastName, 'Doe')
    assert.strictEqual(parsed.role, 'applicant')
})

test('Registration schema rejects combined full name input', () => {
    assert.throws(() =>
        registerSchema.parse({
            email: 'john@example.com',
            phoneNumber: '+254712345678',
            password: 'SecurePassword123',
            fullName: 'John Doe',
            nationalId: '12345678'
        } as never)
    )
})
