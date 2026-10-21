import {test,expect} from '@playwright/test';

const cms='http://localhost:3035';
const sections=['hero','portfolioProofPoints','capitalEfficiency','capitarDifference','caseStudy'] as const;

test('one published Homepage API populates all five sections and their nested media',async({request})=>{
 const response=await request.get(cms+'/api/homepage');expect(response.ok()).toBeTruthy();const {data}=await response.json();
 for(const section of sections){expect(data[section].heading).toBeTruthy();expect(data[section].enabled).toBe(true);}
 expect(data.hero.trustedClients.length).toBeGreaterThan(0);expect(data.hero.trustedClients[0].logo.url).toMatch(/^\/uploads\//);
 expect(data.portfolioProofPoints.metrics.length).toBeGreaterThan(0);
 expect(data.capitalEfficiency.benefits[0].artwork.url).toMatch(/^\/uploads\//);
 expect(data.capitarDifference.items[0].image.url).toMatch(/^\/uploads\//);
 expect(data.caseStudy.items[0].image.url).toMatch(/^\/uploads\//);expect(data.caseStudy.items[0].logo.url).toMatch(/^\/uploads\//);
});

test('all five section headings render CMS values through the shared homepage request',async({page,request})=>{
 const data=(await (await request.get(cms+'/api/homepage')).json()).data;
 for(const section of sections)data[section].heading='CMS '+section+' heading';
 const routes=new Set<string>();page.on('request',r=>{const path=new URL(r.url()).pathname;if(path.startsWith('/api/'))routes.add(path);});
 await page.route('**/api/homepage',r=>r.fulfill({json:{data}}));await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 for(const [section,selector] of [['hero','#hero-heading'],['portfolioProofPoints','#proof-heading'],['capitalEfficiency','#capital-heading'],['capitarDifference','#difference-heading'],['caseStudy','#case-study-heading']] as const)await expect(page.locator(selector)).toHaveText('CMS '+section+' heading');
 expect([...routes].sort()).toEqual(['/api/global','/api/homepage']);
});
