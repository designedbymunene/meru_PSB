import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateProfileCompletion, applicantProfileSchema } from '@meru/shared'

test('profile completion marks required sections separately from optional ones', () => {
    const profile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: 'john@example.com',
        homeCountyId: 1,
        homeSubCountyId: 1,
        wardId: 1,
        ethnicityId: 1,
        qualifications: [{}],
        hasNoExperience: true,
        hasNoTrainings: true,
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
    assert.ok(completion.requiredMissing.includes('Personal Information'))
    assert.ok(completion.requiredMissing.includes('Academic History'))
})

test('profile completion blocks application when home county, sub-county, or ward are missing', () => {
    const profile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: 'john@example.com',
        ethnicityId: 1,
        qualifications: [{}],
        hasNoExperience: true,
        hasNoTrainings: true,
        // missing home location IDs
    }

    const completion = calculateProfileCompletion(profile)

    assert.equal(completion.canApply, false)
    assert.ok(completion.requiredMissing.includes('Personal Information'))
})

test('profile validation schema enforces home county, sub-county, and ward IDs', () => {

    const invalidProfile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: 'john@example.com',
        ethnicityId: 1,
        // missing homeCountyId, homeSubCountyId, wardId
    }

    const result = applicantProfileSchema.safeParse(invalidProfile)
    assert.equal(result.success, false)
    if (!result.success) {
        const paths = result.error.issues.map((i: any) => i.path[0])
        assert.ok(paths.includes('homeCountyId'))
        assert.ok(paths.includes('homeSubCountyId'))
        assert.ok(paths.includes('wardId'))
    }

    const validProfile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: 'john@example.com',
        ethnicityId: 1,
        homeCountyId: 13, // Tharaka-Nithi
        homeSubCountyId: 60, // Maara
        wardId: 200,
    }

    const validResult = applicantProfileSchema.safeParse(validProfile)
    assert.equal(validResult.success, true)
})

test('profile validation schema fails when gender is null', () => {
    const invalidProfile = {
        fullName: 'John Doe',
        idNumber: '12345678',
        gender: null,
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: 'john@example.com',
        ethnicityId: 1,
        homeCountyId: 13,
        homeSubCountyId: 60,
        wardId: 200,
    }

    const result = applicantProfileSchema.safeParse(invalidProfile)
    assert.equal(result.success, false)
})

