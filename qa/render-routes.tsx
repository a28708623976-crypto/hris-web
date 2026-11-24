import React from 'react';
import {renderToString} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import App from '../src/App';
import {useStore} from '../src/store';
import {canAccess} from '../src/utils/permissions';
import assert from 'node:assert/strict';
import type {Role} from '../src/types';
const originalError=console.error;console.error=(...args:unknown[])=>{if(!String(args[0]).includes('useLayoutEffect'))originalError(...args)};
const originalWarn=console.warn;console.warn=(...args:unknown[])=>{if(!String(args[0]).includes('storage is currently unavailable'))originalWarn(...args)};

const routes=['/dashboard','/employees','/employees?new=1','/employees/EMP001','/lifecycle','/lifecycle/new/onboard','/lifecycle/new/confirm','/lifecycle/new/transfer','/lifecycle/new/salary_adjust','/lifecycle/new/resign','/lifecycle/new/renew','/lifecycle/new/transfer?draft=LC003','/lifecycle/LC001','/contracts','/attendance','/attendance/salary','/certificates','/self-service','/self-service/my-profile','/self-service/my-requests','/self-service/my-requests?new=1','/recruiting/jobs','/recruiting/candidates','/recruiting/interviews','/performance','/performance/cycles','/performance/review/RV001','/403'];
let count=0;
for(const role of ['hr_lead','hr','boss','employee','manager'] as Role[]){
 useStore.setState({role});
 Object.assign(useStore.getInitialState(),useStore.getState());
 for(const route of routes){
  if(!canAccess(role,route.split('?')[0]))continue;
  const html=renderToString(<MemoryRouter initialEntries={[route]}><App/></MemoryRouter>);
  assert.ok(html.length>500,`${role} ${route} renders`);
  assert.ok(!html.includes('NaN'),`${role} ${route} has valid numeric output`);
  if(['employee','hr','manager'].includes(role))assert.ok(!html.includes('调后薪资'),`${role} ${route} hides salary form`);
  if(role==='employee'&&route==='/attendance'){
   assert.ok(html.includes('林晓梅'));assert.ok(!html.includes('张伟'));assert.ok(!html.includes('陈嘉宁'));
  }
  if(role==='manager'&&route==='/employees'){
   assert.ok(html.includes('陈嘉宁'));assert.ok(html.includes('宋一诺'));assert.ok(!html.includes('林晓梅'));assert.ok(!html.includes('王芳'));
  }
  count++;
 }
}
console.log(`PASS ${count} route/role render combinations; personal and department scopes checked.`);
