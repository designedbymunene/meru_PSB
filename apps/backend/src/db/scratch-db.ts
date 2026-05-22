import { db, pool } from './index'
import { applicantProfiles, counties, constituencies, wards } from './schema'
import { eq } from 'drizzle-orm'

async function inspectProfiles() {
    try {
        const profiles = await db.select().from(applicantProfiles)
        const countiesList = await db.select().from(counties)
        const constituenciesList = await db.select().from(constituencies)
        const wardsList = await db.select().from(wards)

        console.log(`Total profiles in DB: ${profiles.length}`)

        const countyMap = new Map(countiesList.map(c => [c.id, c.name]))
        const constMap = new Map(constituenciesList.map(c => [c.id, c.name]))
        const wardMap = new Map(wardsList.map(w => [w.id, w.name]))

        // Group by home county
        const countyCounts: Record<string, number> = {}
        for (const p of profiles) {
            const cName = countyMap.get(p.homeCountyId ?? -1) ?? 'Unknown'
            countyCounts[cName] = (countyCounts[cName] || 0) + 1
        }
        console.log('\nProfiles count by Home County:', countyCounts)

        // Find profiles with missing sub-county or ward
        const missingSubOrWard = profiles.filter(p => !p.homeSubCountyId || !p.wardId)
        console.log(`\nProfiles with missing Home Sub-County or Ward count: ${missingSubOrWard.length}`)

        if (missingSubOrWard.length > 0) {
            console.log('Sample of profiles with missing sub-county/ward:')
            console.log(missingSubOrWard.slice(0, 10).map(p => ({
                id: p.id,
                fullName: p.fullName,
                homeCounty: countyMap.get(p.homeCountyId ?? -1) ?? 'Unknown',
                homeSubCounty: constMap.get(p.homeSubCountyId ?? -1) ?? 'NULL',
                ward: wardMap.get(p.wardId ?? -1) ?? 'NULL',
                residenceCounty: countyMap.get(p.residenceCountyId ?? -1) ?? 'Unknown',
                residenceSubCounty: constMap.get(p.residenceSubCountyId ?? -1) ?? 'NULL',
                residenceWard: wardMap.get(p.residenceWardId ?? -1) ?? 'NULL'
            })))
        }

        // Show a few fully mapped profiles
        const fullyMapped = profiles.filter(p => p.homeSubCountyId && p.wardId)
        console.log(`\nFully mapped profiles count: ${fullyMapped.length}`)
        if (fullyMapped.length > 0) {
            console.log('Sample of fully mapped profiles:')
            console.log(fullyMapped.slice(0, 5).map(p => ({
                id: p.id,
                fullName: p.fullName,
                homeCounty: countyMap.get(p.homeCountyId ?? -1) ?? 'Unknown',
                homeSubCounty: constMap.get(p.homeSubCountyId ?? -1) ?? 'Unknown',
                ward: wardMap.get(p.wardId ?? -1) ?? 'Unknown',
                residenceCounty: countyMap.get(p.residenceCountyId ?? -1) ?? 'Unknown',
                residenceSubCounty: constMap.get(p.residenceSubCountyId ?? -1) ?? 'Unknown',
                residenceWard: wardMap.get(p.residenceWardId ?? -1) ?? 'Unknown'
            })))
        }

    } catch (e) {
        console.error(e)
    } finally {
        await pool.end()
    }
}

inspectProfiles()



