/**
 * Build the updated HTML file with new projection SVG paths.
 * Reads current HTML, replaces SVG_PATHS and viewBox, writes result.
 */
const fs = require('fs');

const html = fs.readFileSync('/home/z/my-project/public/pfo-map.html', 'utf8');
const newPaths = fs.readFileSync('/home/z/my-project/download/svg_paths.js', 'utf8');

// The new viewBox from projection
const NEW_VIEWBOX = '-5 -8 115 115';

// 1. Replace SVG_PATHS block
// Find "const SVG_PATHS = {" and the matching closing "};"
const pathsStart = html.indexOf('const SVG_PATHS = {');
if (pathsStart === -1) throw new Error('SVG_PATHS not found');

// Find the matching closing "};"
let depth = 0;
let pathsEnd = -1;
let inString = false;
let stringChar = '';
for (let i = pathsStart; i < html.length; i++) {
    const ch = html[i];
    const prev = i > 0 ? html[i - 1] : '';
    
    if (inString) {
        if (ch === stringChar && prev !== '\\') inString = false;
        continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}') {
        depth--;
        if (depth === 0) {
            // Check if next char is ";"
            const rest = html.substring(i + 1).trimStart();
            if (rest.startsWith(';')) {
                pathsEnd = i + 1 + html.substring(i + 1).indexOf(';') + 1;
                break;
            }
        }
    }
}

if (pathsEnd === -1) throw new Error('SVG_PATHS end not found');
console.log(`SVG_PATHS: lines ~${html.substring(0, pathsStart).split('\n').length} to ~${html.substring(0, pathsEnd).split('\n').length}`);

const updatedHtml = html.substring(0, pathsStart) + newPaths.trim() + '\n' + html.substring(pathsEnd + 1);

// 2. Replace viewBox
const updatedHtml2 = updatedHtml.replace(
    'viewBox="0 0 900 700"',
    `viewBox="${NEW_VIEWBOX}"`
);

// 3. Write result
fs.writeFileSync('/home/z/my-project/public/pfo-map.html', updatedHtml2);
console.log('✅ HTML updated successfully');
console.log(`   viewBox set to: ${NEW_VIEWBOX}`);

// Verify
const verify = fs.readFileSync('/home/z/my-project/public/pfo-map.html', 'utf8');
console.log(`   File size: ${(verify.length / 1024).toFixed(1)} KB`);
console.log(`   Contains viewBox: ${verify.includes(NEW_VIEWBOX)}`);
console.log(`   Contains new paths: ${verify.includes('Республика Башкортостan') || verify.includes('Республика Башкортостан')}`);
