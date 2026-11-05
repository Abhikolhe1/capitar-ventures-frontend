import { chromium, firefox, webkit, expect } from '@playwright/test';
const sizes = process.env.PIXEL_SIZES ? JSON.parse(process.env.PIXEL_SIZES) : [[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440],[1366,600]];
let failures=0;
for (const [name, engine] of Object.entries({chromium,firefox,webkit})) {
 if(process.env.PIXEL_ENGINE && name !== process.env.PIXEL_ENGINE) continue;
 const browser=await engine.launch({headless:true});
 try {
  for(const [width,height] of sizes) {
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:Number(process.env.PIXEL_DPR||1),reducedMotion:'no-preference'});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   try {
    await page.goto('http://72.61.232.63:3051/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy','false',{timeout:20000});
    await expect.poll(()=>page.locator('.vd-pixel-reveal img').evaluate(i=>i.naturalWidth>0),{timeout:20000}).toBe(true);
    const results=[];
    for(const index of [0,1,3,2]) {
     const result=await page.evaluate(async ({index,height})=>{
      const track=document.querySelector('.vd-signals-track');
      const panel=track.firstElementChild;
      const root=document.querySelector('.vd-pixel-reveal');
      const canvas=root.querySelector('canvas');
      const pinned=height>=640;
      const y=pinned ? scrollY+track.getBoundingClientRect().top-parseFloat(getComputedStyle(panel).top)+(track.offsetHeight-panel.offsetHeight)*(index+0.4)/4 : scrollY+track.querySelector('#signal-'+index).closest('.vd-signal').getBoundingClientRect().top-height*0.5;
      scrollTo({top:y,behavior:'instant'});
      let animatedVisible=false, visibleRatio=0;
      const start=performance.now();
      while(performance.now()-start<1300) {
       const rect=root.getBoundingClientRect();
       const visible=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0))/rect.height;
       visibleRatio=Math.max(visibleRatio,visible);
       if(canvas.width&&canvas.height) {
        const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        let covered=0,total=0;
        for(let i=3;i<pixels.length;i+=400){total++;if(pixels[i]>0)covered++;}
        const ratio=covered/total;
        if(visible>0.15&&ratio>0.02&&ratio<0.98) animatedVisible=true;
       }
       await new Promise(resolve=>setTimeout(resolve,30));
      }
      const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      return {index,active:Number(root.dataset.pixelIndex),visibleRatio:Number(visibleRatio.toFixed(2)),animatedVisible,complete:!pixels.some((v,i)=>i%4===3&&v>0)};
     },{index,height});
     // Browser rendering and late layout refreshes can restart the entry
     // reveal; verify eventual completion independently of the sample window.
     if(!result.complete) {
      await expect.poll(()=>page.locator('.vd-pixel-reveal canvas').evaluate(c=>!c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)),{timeout:5000}).toBe(true);
      result.complete=true;
     }
     results.push(result);
    }
    const passed=results.every(r=>r.index===r.active&&r.animatedVisible&&r.complete);
    console.log(JSON.stringify({name,width,height,passed,results,errors}));
    if(!passed||errors.length)failures++;
   } catch(e) {failures++; console.log(JSON.stringify({name,width,height,error:e.message}));}
   finally{await page.close();}
  }
 } finally {await browser.close();}
}
console.log('FAILURES='+failures);
process.exitCode=failures?1:0;
