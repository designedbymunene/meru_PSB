import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve('/Users/nozel/Developer/work/MERU_PSB');
const schemaDir = path.join(projectRoot, 'apps/backend/src/db/schema');
const backendSrcDir = path.join(projectRoot, 'apps/backend/src');
const webAppDir = path.join(projectRoot, 'apps/web');

const schemaFiles = fs.readdirSync(schemaDir)
    .filter(file => file.endsWith('.ts') && !['index.ts', 'relations.ts', 'common.ts'].includes(file));

interface TableInfo {
    name: string;
    file: string;
}

const tables: TableInfo[] = [];
const tableRegex = /export\s+const\s+(\w+)\s*=\s*pgTable/g;

for (const file of schemaFiles) {
    const filePath = path.join(schemaDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let match;
    tableRegex.lastIndex = 0;
    while ((match = tableRegex.exec(content)) !== null) {
        tables.push({
            name: match[1],
            file
        });
    }
}

function getFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            const base = path.basename(filePath);
            if (['node_modules', '.next', 'dist', 'build', '.git', '.claude'].includes(base)) continue;
            results = results.concat(getFiles(filePath));
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                results.push(filePath);
            }
        }
    }
    return results;
}

const backendFiles = getFiles(backendSrcDir).filter(f => !f.includes('/db/'));
const webFiles = getFiles(webAppDir);
const allFiles = [...backendFiles, ...webFiles];

console.log(`Scanning ${allFiles.length} application files...`);

const fileContents = allFiles.map(f => ({
    path: f,
    content: fs.readFileSync(f, 'utf-8')
}));

const tableUsages: Record<string, { count: number; files: string[] }> = {};
for (const t of tables) {
    tableUsages[t.name] = { count: 0, files: [] };
}

for (const file of fileContents) {
    for (const t of tables) {
        // Look for imports or references as a separate word
        const regex = new RegExp(`\\b${t.name}\\b`, 'g');
        const matches = file.content.match(regex);
        if (matches) {
            tableUsages[t.name].count += matches.length;
            const relPath = path.relative(projectRoot, file.path);
            tableUsages[t.name].files.push(`${relPath} (${matches.length})`);
        }
    }
}

console.log('\n--- TABLE USAGE IN APPLICATION CODES (EXCLUDING DB DIRECTORY) ---');
for (const t of tables) {
    const usage = tableUsages[t.name];
    console.log(`Table: ${t.name} (from schema/${t.file}) - Usage Count: ${usage.count}`);
    if (usage.count === 0) {
        console.log('  -> WARNING: COMPLETELY UNUSED OUTSIDE DB SEED/MIGRATIONS!');
    } else {
        console.log(`  -> First 3 files: ${usage.files.slice(0, 3).join(', ')}`);
    }
}
