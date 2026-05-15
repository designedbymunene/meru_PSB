import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateProfileCompletion } from '@meru/shared'

test('profile completion marks required sections separately from optional ones', () => {
    const profile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: 'john@example.com',
        qualifications: [{}],
    }

    const completion = calculateProfileCompletion(profile)

    assert.equal(completion.canApply, true)
    assert.equal(completion.requiredPercentage, 100)
    assert.equal(completion.optionalPercentage < 100, true)
    assert.deepEqual(completion.requiredMissing, [])
})

test('profile completion blocks application when required sections are missing', () => {
    const profile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
    }

    const completion = calculateProfileCompletion(profile)

    assert.equal(completion.canApply, false)
    assert.ok(completion.requiredMissing.includes('Contact Details'))
    assert.ok(completion.requiredMissing.includes('Academic History'))
})
