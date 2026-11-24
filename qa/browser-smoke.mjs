import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1120}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.getByRole('heading',{name:/好，李明/}).waitFor();await page.screenshot({path:'qa/dashboard-desktop.png',fullPage:true});
for(const path of ['/employees','/employees/EMP001','/lifecycle','/lifecycle/new/onboard','/lifecycle/new/confirm','/lifecycle/new/transfer','/lifecycle/new/salary_adjust','/lifecycle/new/resign','/lifecycle/new/renew','/lifecycle/LC001','/contracts','/attendance','/attendance/salary','/certificates','/self-service','/self-service/my-profile','/self-service/my-requests','/recruiting/jobs','/recruiting/candidates','/recruiting/interviews','/performance','/performance/cycles','/performance/review/RV001']) {await page.goto('http://127.0.0.1:5173'+path);await page.locator('main h1').waitFor();if(await page.locator('.vite-error-overlay').count())throw new Error(path+' failed');console.log('PASS route '+path)}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/dashboard');await page.screenshot({path:'qa/dashboard-mobile.png',fullPage:true});console.log('MOBILE overflow',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
console.log('PAGE ERRORS',errors);await browser.close();if(errors.length)process.exitCode=1;
