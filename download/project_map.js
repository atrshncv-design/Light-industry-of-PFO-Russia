/**
 * Коническая равнопромежуточная проекция для карты ПФО
 *
 * Параметры:
 *   φ₁ = 52°00′ с.ш.  (первая стандартная параллель)
 *   φ₂ = 58°00′ с.ш.  (вторая стандартная параллель)
 *   λ₀ = 52°00′ в.д.  (средний меридиан)
 *
 * Формулы:
 *   x = 50 + 440.7367655 * (1.659498624 − (lat·π/180)) * sin(0.818777804 * (lon−52) * π/180) * 0.9885
 *   y = 53.84615367 − 440.7367655 * (0.699567535 − (1.659498624 − (lat·π/180)) * cos(0.818777804 * (lon−52) * π/180))
 */

const fs = require('fs');
const path = require('path');

// ---- Projection constants ----
const PI = Math.PI;
const C1 = 440.7367655;
const C2 = 1.659498624;
const N  = 0.818777804;
const K  = 0.9885;
const X0 = 50;
const Y0 = 53.84615367;
const LAM0 = 52;  // central meridian (longitude)

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

// ---- Douglas-Peucker simplification ----
function perpendicularDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx, projY = y1 + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
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

// ---- GeoJSON processing ----
const geojson = JSON.parse(fs.readFileSync('/home/z/my-project/download/pfo_regions.json', 'utf8'));

const PFO_REGIONS = [
  'Республика Башкортостан', 'Республика Марий Эл', 'Республика Мордовия',
  'Республика Татарстан', 'Удмуртская Республика', 'Чувашская Республика',
  'Пермский край', 'Кировская область', 'Нижегородская область',
  'Оренбургская область', 'Пензенская область', 'Самарская область',
  'Саратовская область', 'Ульяновская область'
];

const SIMPLIFICATION_TOLERANCE = 0.3;  // SVG units

const regionPaths = {};
let allX = [], allY = [];

PFO_REGIONS.forEach(name => {
  const feature = geojson.features.find(f => f.properties.name === name);
  if (!feature) { console.error('NOT FOUND:', name); return; }

  const geom = feature.geometry;
  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const pathParts = [];

  polygons.forEach((poly, pi) => {
    // poly[0] is the outer ring; poly[1..] are holes
    // For map rendering, we use only outer rings (poly[0])
    const ring = poly[0];
    // GeoJSON: [lon, lat]
    const projected = ring.map(c => project(c[0], c[1]));
    const simplified = simplifyDP(projected, SIMPLIFICATION_TOLERANCE);

    simplified.forEach(([x, y]) => { allX.push(x); allY.push(y); });

    const d = simplified.map(([x, y], i) =>
      `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    ).join(' ') + ' Z';
    pathParts.push(d);
  });

  regionPaths[name] = pathParts;
  console.log(`✓ ${name}: ${pathParts.length} polygon(s), points before simplification: ${feature.geometry.type === 'Polygon' ? feature.geometry.coordinates[0].length : feature.geometry.coordinates.reduce((s, p) => s + p[0].length, 0)}`);
});

// ---- Compute viewBox ----
const minX = Math.min(...allX) - 5;
const maxX = Math.max(...allX) + 5;
const minY = Math.min(...allY) - 5;
const maxY = Math.max(...allY) + 5;
const vbW = maxX - minX;
const vbH = maxY - minY;

console.log(`\nViewBox: ${minX.toFixed(2)} ${minY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`);
console.log(`X range: ${minX.toFixed(2)}..${maxX.toFixed(2)}`);
console.log(`Y range: ${minY.toFixed(2)}..${maxY.toFixed(2)}`);

// ---- Output SVG paths as JS ----
// Build the SVG_PATHS object for the HTML
let jsOutput = 'const SVG_PATHS = {\n';
PFO_REGIONS.forEach(name => {
  const parts = regionPaths[name];
  if (parts.length === 1) {
    jsOutput += `  "${name}": [\n    "${parts[0]}"\n  ],\n`;
  } else {
    jsOutput += `  "${name}": [\n`;
    parts.forEach(p => { jsOutput += `    "${p}",\n`; });
    jsOutput += `  ],\n`;
  }
});
jsOutput += '};\n';

fs.writeFileSync('/home/z/my-project/download/svg_paths.js', jsOutput);
console.log('\n✅ Saved svg_paths.js');

// ---- Also generate a standalone SVG for preview ----
let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}" width="${Math.round(vbW)}" height="${Math.round(vbH)}">\n`;
svgContent += `  <rect x="${minX}" y="${minY}" width="${vbW}" height="${vbH}" fill="#1a1a2e"/>\n`;
PFO_REGIONS.forEach(name => {
  const parts = regionPaths[name];
  parts.forEach(p => {
    svgContent += `  <path class="region" d="${p}" stroke="#4caf50" stroke-width="1" fill="#2a4a2e" />\n`;
  });
});
svgContent += `</svg>\n`;
fs.writeFileSync('/home/z/my-project/download/pfo_map_preview.svg', svgContent);
console.log('✅ Saved pfo_map_preview.svg');
console.log(`\nViewBox: ${minX.toFixed(2)} ${minY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`);
