#!/usr/bin/env node
/**
 * Dynamic IP Detection Script for Local Development
 *
 * This script detects the machine's local IP address and updates the
 * USE_LOCAL_IP and LOCAL_IP values in lib/api/client.ts
 *
 * Usage: node scripts/set-local-ip.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to the client.ts file
const clientPath = path.join(__dirname, '../src/lib/api/client.ts');

/**
 * Get the local IP address of the machine
 * Returns the first non-internal IPv4 address
 */
function getLocalIP() {
  try {
    const interfaces = os.networkInterfaces();

    // Find the first non-internal IPv4 address
    for (const ifaceName of Object.keys(interfaces)) {
      const iface = interfaces[ifaceName];
      for (const config of iface) {
        if (config.family === 'IPv4' && !config.internal) {
          return config.address;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error detecting local IP:', error);
    return null;
  }
}

/**
 * Update the client.ts file with the detected IP
 */
function updateClientFile(ip) {
  try {
    if (!fs.existsSync(clientPath)) {
      console.error(`Client file not found: ${clientPath}`);
      return false;
    }

    let content = fs.readFileSync(clientPath, 'utf-8');

    // Pattern to match the LOCAL_IP assignment
    // Looking for: const LOCAL_IP = dynamicIP || '192.168.100.92';
    const localIpPattern = /const LOCAL_IP = dynamicIP \|\| '[\d.]+';/;

    if (localIpPattern.test(content)) {
      content = content.replace(
        localIpPattern,
        `const LOCAL_IP = dynamicIP || '${ip}';`
      );
    } else {
      console.error('Could not find LOCAL_IP pattern in client.ts');
      return false;
    }

    fs.writeFileSync(clientPath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error updating client file:', error);
    return false;
  }
}

// Main execution
const localIP = getLocalIP();

if (!localIP) {
  console.error('❌ Could not detect local IP address');
  console.error('Please ensure you are connected to a network');
  process.exit(1);
}

console.log(`🔍 Detected local IP: ${localIP}`);

if (updateClientFile(localIP)) {
  console.log(`✅ Updated ${path.relative(process.cwd(), clientPath)} with local IP: ${localIP}`);
  console.log('\nYou can now run: npm start (or expo start)');
  console.log('Make sure USE_LOCAL_IP is set to true in the client file.');
} else {
  console.error('❌ Failed to update client file');
  process.exit(1);
}
