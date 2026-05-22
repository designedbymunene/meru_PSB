import fs from 'fs';
import readline from 'readline';
import path from 'path';

async function extractSqlData(filePath: string) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentTable: 'users' | 'profiles' | null = null;
    const users: any[] = [];
    const profiles: any[] = [];

    for await (const line of rl) {
        if (line.startsWith('COPY public.users ')) {
            currentTable = 'users';
            continue;
        } else if (line.startsWith('COPY public.applicant_profiles ')) {
            currentTable = 'profiles';
            continue;
        } else if (line.trim() === '\\.') {
            currentTable = null;
            continue;
        }

        if (currentTable === 'users') {
            const parts = line.split('\t');
            if (parts.length >= 6) {
                users.push({ id: parts[0], username: parts[1], email: parts[2], role: parts[5] });
            }
        } else if (currentTable === 'profiles') {
            const parts = line.split('\t');
            if (parts.length >= 12) {
                profiles.push({ 
                    id: parts[0], 
                    userId: parts[1], 
                    name: parts[2], 
                    idNumber: parts[3], 
                    phone: parts[7], 
                    email: parts[8],
                    homeCounty: parts[9],
                    homeSubCounty: parts[10],
                    ward: parts[11]
                });
            }
        }
    }

    // Merge users with profiles mapping over matching IDs
    const mergedData = profiles.map(profile => {
        const userObj = users.find(u => u.id === profile.userId);
        return {
            userId: profile.userId,
            username: userObj ? userObj.username : 'N/A',
            name: profile.name,
            idNumber: profile.idNumber,
            phone: profile.phone,
            email: profile.email,
            role: userObj ? userObj.role : 'N/A',
            homeCounty: profile.homeCounty,
            homeSubCounty: profile.homeSubCounty,
            ward: profile.ward,
            residenceCounty: profile.homeCounty, // Default to home
            residenceSubCounty: profile.homeSubCounty, // Default to home
            residenceWard: profile.ward // Default to home
        };
    });

    const outputPath = path.join(process.cwd(), 'extracted_output.json');
    fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));
    console.log(`Extraction complete! Matched ${mergedData.length} profiles successfully.`);
}

const sqlFilePath = path.join(process.cwd(), 'sql', 'meru_county_psb_backup.sql');
extractSqlData(sqlFilePath);
