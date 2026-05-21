import re
import pandas as pd
import json
import os

# ==========================================
# CONFIGURATION
# ==========================================
# This script reads administrative hierarchy data from a local SQL dump 
# instead of a remote MySQL database to ensure offline reliability.
SQL_FILE = '/Users/nozel/Downloads/kenya20260430.sql'
OUTPUT_FILE = 'kenya_admin_hierarchy.csv'

def extract_values(sql_content, table_name):
    # Pattern to find INSERT INTO `table` VALUES (...);
    pattern = rf"INSERT INTO `{table_name}` VALUES\s*(.*?);"
    match = re.search(pattern, sql_content, re.DOTALL | re.IGNORECASE)
    if not match:
        return []
    
    rows_raw = match.group(1).strip()
    
    rows = []
    current_row = ""
    inside_string = False
    depth = 0
    
    i = 0
    while i < len(rows_raw):
        char = rows_raw[i]
        if char == "'" and (i == 0 or rows_raw[i-1] != "\\"):
            inside_string = not inside_string
        
        if not inside_string:
            if char == "(":
                if depth == 0:
                    current_row = ""
                depth += 1
                if depth > 1:
                    current_row += char
            elif char == ")":
                depth -= 1
                if depth == 0:
                    rows.append(current_row)
                else:
                    current_row += char
            elif depth > 0:
                current_row += char
        else:
            current_row += char
        i += 1
    return rows

def parse_row(row_str):
    # Split by comma but respect strings
    values = []
    current = ""
    inside_string = False
    i = 0
    while i < len(row_str):
        char = row_str[i]
        if char == "'" and (i == 0 or row_str[i-1] != "\\"):
            inside_string = not inside_string
        elif char == "," and not inside_string:
            values.append(current.strip())
            current = ""
        else:
            current += char
        i += 1
    values.append(current.strip())
    
    # Clean up values (remove quotes and handle escapes)
    return [v[1:-1].replace("\\'", "'") if v.startswith("'") and v.endswith("'") else (None if v == "NULL" else v) for v in values]

def main():
    try:
        if not os.path.exists(SQL_FILE):
            print(f"Error: SQL file not found at {SQL_FILE}")
            print("Please ensure the file exists or update SQL_FILE path in the script.")
            return

        print(f"Reading SQL from: {SQL_FILE}")
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # 1. Parse Counties
        print("Parsing counties...")
        county_rows = extract_values(sql_content, 'counties')
        counties = {}
        for row in county_rows:
            parsed = parse_row(row)
            # Schema: id, code, name, slug, ...
            counties[int(parsed[0])] = parsed[2]

        # 2. Parse Constituencies
        print("Parsing constituencies...")
        constituency_rows = extract_values(sql_content, 'constituencies')
        constituencies = {}
        for row in constituency_rows:
            parsed = parse_row(row)
            # Schema: id, county_id, code, name, slug, ...
            constituencies[int(parsed[0])] = {
                'name': parsed[3],
                'county_id': int(parsed[1])
            }

        # 3. Parse Wards
        print("Parsing wards...")
        ward_rows = extract_values(sql_content, 'wards')
        records = []
        for row in ward_rows:
            parsed = parse_row(row)
            # Schema: id, constituency_id, code, name, slug, voters, polling_stations, ...
            constituency_id = int(parsed[1])
            constituency = constituencies.get(constituency_id)
            if not constituency:
                continue
            
            county_name = counties.get(constituency['county_id'])
            if not county_name:
                continue
                
            records.append({
                'county': county_name,
                'sub_county': constituency['name'],
                'ward': parsed[3]
            })

        df = pd.DataFrame(records)

        # Remove duplicates
        df = df.drop_duplicates(subset=['county', 'sub_county', 'ward'])
        
        # Sort by hierarchy
        df = df.sort_values(by=['county', 'sub_county', 'ward'])

        # Save to CSV
        df.to_csv(OUTPUT_FILE, index=False)

        print(f"Success! Extracted {len(df)} records.")
        print(f"File saved to: {OUTPUT_FILE}")
        
        print("\nPreview of hierarchy:")
        print(df.head(10))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
