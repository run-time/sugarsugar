#!/usr/bin/env node

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create public directory structure
const publicDir = `${__dirname}/public`;

try {
  mkdirSync(publicDir, { recursive: true });
} catch {
  // Directory might already exist
}

// Read existing index.html or create a default one
const indexHtmlPath = `${publicDir}/index.html`;
let indexHTML;

if (existsSync(indexHtmlPath)) {
  // Read the existing index.html file
  indexHTML = readFileSync(indexHtmlPath, 'utf8');
  console.log('📖 Reading existing public/index.html');
} else {
  // Create default index.html if it doesn't exist
  indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SugarSugar API</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            line-height: 1.6;
            background: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .endpoint { 
            background: #f1f3f4; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0;
            border-left: 4px solid #007acc;
        }
        .endpoint code { 
            background: #e8f4f8; 
            padding: 2px 6px; 
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        a { color: #007acc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .status { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.9em;
            font-weight: bold;
        }
        .status.live { background: #d4edda; color: #155724; }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            text-align: center; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍭 SugarSugar API</h1>
        <p><strong>A webservice to ask Dexcom Share servers for blood glucose data</strong></p>
        <p><span class="status live">LIVE</span> API Version 1.0.0</p>

        <h2>📊 Available Endpoints</h2>
        
        <div class="endpoint">
            <strong>GET <code>/api/health</code></strong><br>
            Service health check and status
        </div>

        <div class="endpoint">
            <strong>GET <code>/api/glucose</code></strong><br>
            Latest glucose reading with simple format
        </div>

        <h2>🧪 Test the API</h2>
        <p>Try these endpoints:</p>
        <ul>
            <li><a href="/api/health" target="_blank">Health Check</a></li>
            <li><a href="/api/glucose" target="_blank">Latest Glucose</a></li>
        </ul>

        <h2>📖 Documentation</h2>
        <p>For complete setup instructions and API documentation, visit the 
        <a href="https://github.com/run-time/sugarsugar" target="_blank">GitHub repository</a>.</p>

        <div class="footer">
            <p>Made with ❤️ by Dave Alger | Powered by Dexcom Share API</p>
            <p><small>This project is not affiliated with Dexcom, Inc.</small></p>
        </div>
    </div>
</body>
</html>`;
  console.log('🆕 Created default public/index.html');
}

// The file is now read from disk, so we don't need to write it again
// unless we're creating a default one
if (!existsSync(indexHtmlPath)) {
  writeFileSync(indexHtmlPath, indexHTML);
}

console.log('✅ Build process completed');
console.log('📁 Using: public/index.html');
console.log('\n\n\x1b[32m🚀 Ready for Vercel deployment!\x1b[0m\n\n');
