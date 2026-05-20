import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve('/Users/nozel/Developer/work/MERU_PSB');
const schemaDir = path.join(projectRoot, 'apps/backend/src/db/schema');
const backendSrcDir = path.join(projectRoot, 'apps/backend/src');
const webAppDir = path.join(projectRoot, 'apps/web');

const schemaFiles = fs.readdirSync(schemaDir)
    .filter(file => file.endsWith('.ts') && !['index.ts', 'relations.ts', 'common.ts'].includes(file));

interface ColumnInfo {
    name: string;
    line: string;
}

interface TableInfo {
    exportName: string;
    dbName: string;
    columns: ColumnInfo[];
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
        const exportName = match[1];
        
        const tableStartIndex = content.indexOf(match[0]);
        const columnsStartIndex = content.indexOf('{', tableStartIndex);
        
        let braceCount = 1;
        let index = columnsStartIndex + 1;
        while (braceCount > 0 && index < content.length) {
            if (content[index] === '{') braceCount++;
            else if (content[index] === '}') braceCount--;
            index++;
        }
        
        const tableBlock = content.slice(columnsStartIndex, index);
        const columnLines = tableBlock.split('\n');
        const columns: ColumnInfo[] = [];
        
        for (const line of columnLines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('//') || cleanLine.startsWith('...') || cleanLine === '' || cleanLine.startsWith('{') || cleanLine.startsWith('}')) {
                continue;
            }
            
            const colMatch = cleanLine.match(/^(\w+)\s*:/);
            if (colMatch) {
                columns.push({
                    name: colMatch[1],
                    line: cleanLine
                });
            }
        }
        
        tables.push({
            exportName,
            dbName: exportName, // generic
            columns,
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

// Find all source files to scan (exclude db folder completely to avoid matches in schemas/seeders/migrations)
const backendFiles = getFiles(backendSrcDir).filter(f => !f.includes('/db/'));
const webFiles = getFiles(webAppDir);
const allFiles = [...backendFiles, ...webFiles];

console.log(`Scanning ${allFiles.length} files...`);

const fileContents = allFiles.map(f => ({
    path: f,
    content: fs.readFileSync(f, 'utf-8')
}));

console.log('\n--- COLUMNS WHOSE NAME APPEARS 0 TIMES IN APPLICATION SOURCE CODE ---');
let totalUnusedCols = 0;
for (const t of tables) {
    const unusedCols = [];
    for (const col of t.columns) {
        // Exclude standard Drizzle/db helper columns like 'id', 'createdAt', 'updatedAt' which are very common names
        if (['id', 'createdAt', 'updatedAt', 'id', 'name', 'status', 'description'].includes(col.name)) {
            continue;
        }
        
        let found = false;
        const colWordRegex = new RegExp(`\\b${col.name}\\b`, 'g');
        for (const file of fileContents) {
            if (file.content.match(colWordRegex)) {
                found = true;
                break;
            }
        }
        if (!found) {
            unusedCols.push(col.name);
        }
    }
    if (unusedCols.length > 0) {
        console.log(`Table: ${t.exportName} (schema/${t.file}) - Unused Columns: ${unusedCols.join(', ')}`);
        totalUnusedCols += unusedCols.length;
    }
}
console.log(`\nFound ${totalUnusedCols} potentially unused columns.`);
