import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const backendRequire = createRequire(new URL('../../capitar-ventures-backend/package.json', import.meta.url));
const sharp = backendRequire('sharp');
for (const name of ['growth', 'dilution', 'momentum']) {
  const source = new URL(`../public/assets/capitar/capital-${name}-art.svg`, import.meta.url);
  await sharp(await fs.readFile(source), { density: 192 }).webp({ quality: 95 })
    .toFile(fileURLToPath(new URL(`../public/assets/capitar/capital-${name}-art.webp`, import.meta.url)));
  await fs.copyFile(source, new URL(`../scratch/phase3/capital-${name}-art.svg`, import.meta.url));
  await fs.unlink(source);
}
console.log('Converted three native raster-backed illustrations to high-resolution WebP; vector icons/background/runway preserved.');
