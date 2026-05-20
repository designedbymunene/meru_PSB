import { describe, expect, it } from 'vitest'
import { getApplicationStatusLabel, serializeApplication } from '../utils/application-status'

describe('application status labels', () => {
    it('maps rejected to Not Successful', () => {
        expect(getApplicationStatusLabel('rejected')).toBe('Not Successful')
    })

    it('adds a label to serialized applications', () => {
        expect(serializeApplication({ id: 1, status: 'shortlisted' }).statusLabel).toBe('Shortlisted')
    })
})
