/**
 * Rebuild SVG_PATHS filtering out degenerate (too small) polygons.
 */
const fs = require('fs');
const path = require('path');

const PI = Math.PI;
const C1 = 440.7367655;
const C2 = 1.659498624;
const N  = 0.818777804;
const K  = 0.9885;
const X0 = 50;
const Y0 = 53.84615367;
const LAM0 = 52;

function project(lon, lat) {
  const latRad = lat * PI / 180;
  const lonDiff = (lon - LAM0) * PI / 180;
  const rho = C2 - latRad;
  const sinTheta = Math.sin(N * lonDiff);
  const cosTheta = Math.cos(N * lonDiff);
  const x = X0 + C1 * rho * sinTheta * K;
  const y = Y0 - C1 * (0.699567535 - rho * cosTheta);
  return [x, y];
}

function perpendicularDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2);
}

function simplifyDP(coords, tolerance) {
  if (coords.length <= 2) return coords;
  let maxDist = 0, maxIdx = 0;
  const [sx, sy] = coords[0], [ex, ey] = coords[coords.length - 1];
  for (let i = 1; i < coords.length - 1; i++) {
    const d = perpendicularDist(coords[i][0], coords[i][1], sx, sy, ex, ey);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const left = simplifyDP(coords.slice(0, maxIdx + 1), tolerance);
    const right = simplifyDP(coords.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [coords[0], coords[coords.length - 1]];
}

// Check if path is degenerate (too few unique points or tiny area)
function isDegeneratePath(pathStr) {
  // Extract coordinates
  const points = pathStr.match(/[\d.]+/g);
  if (!points || points.length < 6) return true; // Need at least 3 points (6 numbers)
  
  // Check for duplicate consecutive points (degenerate)
  const xs = [], ys = [];
  for (let i = 0; i < points.length; i += 2) {
    xs.push(parseFloat(points[i]));
    ys.push(parseFloat(points[i + 1]));
  }
  
  if (xs.length < 3) return true;
  
  // Calculate bounding box
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const bboxArea = (maxX - minX) * (maxY - minY);
  
  if (bboxArea < 0.5) return true; // Too small
  
  // Check all points are the same
  const allSameX = xs.every(x => Math.abs(x - xs[0]) < 0.01);
  const allSameY = ys.every(y => Math.abs(y - ys[0]) < 0.01);
  if (allSameX && allSameY) return true;
  
  return false;
}

const geojson = JSON.parse(fs.readFileSync('/home/z/my-project/download/pfo_regions.json', 'utf8'));

const PFO_REGIONS = [
  'Республика Башкортостан', 'Республика Марий Эл', 'Республика Мордовия',
  'Республика Татарстан', 'Удмуртская Республика', 'Чувашская Республика',
  'Пермский край', 'Кировская область', 'Нижегородская область',
  'Оренбургская область', 'Пензенская область', 'Самарская область',
  'Саратовская область', 'Ульяновская область'
];

const TOLERANCE = 0.25;
const regionPaths = {};
let allX = [], allY = [];

PFO_REGIONS.forEach(name => {
  const feature = geojson.features.find(f => f.properties.name === name);
  if (!feature) { console.error('NOT FOUND:', name); return; }

  const geom = feature.geometry;
  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const pathParts = [];

  polygons.forEach((poly) => {
    const ring = poly[0]; // outer ring only
    const projected = ring.map(c => project(c[0], c[1]));
    const simplified = simplifyDP(projected, TOLERANCE);

    const d = simplified.map(([x, y], i) =>
      `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    ).join(' ') + ' Z';

    if (!isDegeneratePath(d)) {
      simplified.forEach(([x, y]) => { allX.push(x); allY.push(y); });
      pathParts.push(d);
    } else {
      console.log(`  ⚠ Filtered degenerate polygon from ${name}`);
    }
  });

  regionPaths[name] = pathParts;
  console.log(`✓ ${name}: ${pathParts.length} polygon(s)`);
});

const minX = Math.min(...allX) - 3;
const maxX = Math.max(...allX) + 3;
const minY = Math.min(...allY) - 3;
const maxY = Math.max(...allY) + 3;
const vbW = maxX - minX;
const vbH = maxY - minY;
console.log(`\nViewBox: ${minX.toFixed(2)} ${minY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`);

let jsOutput = 'const SVG_PATHS = {\n';
PFO_REGIONS.forEach(name => {
  const parts = regionPaths[name];
  if (parts.length === 0) {
    jsOutput += `  "${name}": [],\n`;
  } else if (parts.length === 1) {
    jsOutput += `  "${name}": [\n    "${parts[0]}"\n  ],\n`;
  } else {
    jsOutput += `  "${name}": [\n`;
    parts.forEach(p => { jsOutput += `    "${p}",\n`; });
    jsOutput += `  ],\n`;
  }
});
jsOutput += '};\n';

fs.writeFileSync('/home/z/my-project/download/svg_paths.js', jsOutput);
fs.writeFileSync('/home/z/my-project/download/viewbox.txt', `${minX.toFixed(2)} ${minY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`);
console.log('\n✅ Files saved');
