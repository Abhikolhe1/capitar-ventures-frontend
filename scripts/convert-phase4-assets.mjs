import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../capitar-ventures-backend/package.json',import.meta.url));
const sharp=require('sharp');
await sharp('scratch/phase4/figma-section.svg').png().toFile('scratch/phase4/figma-section.png');
for(let index=1;index<=4;index++) {
 await sharp(`scratch/phase4/difference-art-${index}.svg`,{density:192}).webp({quality:95}).toFile(`public/assets/capitar/difference-art-${index}.webp`);
}
console.log('Saved original reference and four optimized transparent illustrations.');
