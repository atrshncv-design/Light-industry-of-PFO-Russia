const fs = require('fs');

// We need to rebuild from the original repo HTML since we already modified it
// Let's just re-run the replacement on the current file
const html = fs.readFileSync('/home/z/my-project/public/pfo-map.html', 'utf8');
const newPaths = fs.readFileSync('/home/z/my-project/download/svg_paths.js', 'utf8');
const viewBox = fs.readFileSync('/home/z/my-project/download/viewbox.txt', 'utf8').trim();

// 1. Replace SVG_PATHS block
const pathsStart = html.indexOf('const SVG_PATHS = {');
if (pathsStart === -1) throw new Error('SVG_PATHS not found');

let depth = 0, pathsEnd = -1, inString = false, stringChar = '';
for (let i = pathsStart; i < html.length; i++) {
    const ch = html[i];
    const prev = i > 0 ? html[i - 1] : '';
    if (inString) { if (ch === stringChar && prev !== '\\') inString = false; continue; }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) { const rest = html.substring(i + 1).trimStart(); if (rest.startsWith(';')) { pathsEnd = i + 1 + html.substring(i + 1).indexOf(';') + 1; break; } } }
}
if (pathsEnd === -1) throw new Error('SVG_PATHS end not found');

let updated = html.substring(0, pathsStart) + newPaths.trim() + '\n' + html.substring(pathsEnd + 1);

// 2. Replace viewBox - use regex to handle any current value
updated = updated.replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`);

fs.writeFileSync('/home/z/my-project/public/pfo-map.html', updated);
console.log('✅ HTML rebuilt with clean paths');
console.log(`   viewBox: ${viewBox}`);
console.log(`   Size: ${(updated.length / 1024).toFixed(1)} KB`);

// Verify renderMap function still exists
const renderLine = updated.indexOf('function renderMap');
console.log(`   renderMap at line: ${updated.substring(0, renderLine).split('\n').length}`);
const svgLine = updated.indexOf('id="map-svg"');
console.log(`   map-svg at line: ${updated.substring(0, svgLine).split('\n').length}`);
