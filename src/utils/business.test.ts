import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canAccess, visibleEmployees} from './permissions.ts';
import {calculateSalary,scoreToGrade} from './business.ts';
import type {Role,Employee} from '../types.ts';
test('salary routes require HR lead or boss for every role',()=>{
 for(const role of ['employee','manager','hr','hr_lead','boss'] as Role[]){
  for(const route of ['/attendance/salary','/lifecycle/new/salary_adjust'])assert.equal(canAccess(role,route),['hr_lead','boss'].includes(role));
 }
});
test('employees have only personal pages, attendance and review tasks',()=>{
 for(const route of ['/employees','/contracts','/certificates','/recruiting','/dashboard','/performance/cycles'])assert.equal(canAccess('employee',route),false,route);
 for(const route of ['/self-service','/self-service/my-requests','/attendance','/performance/review/RV001'])assert.equal(canAccess('employee',route),true,route);
});
test('manager page boundaries deny unrelated routes',()=>{
 assert.equal(canAccess('manager','/employees/EMP001'),true);
 assert.equal(canAccess('manager','/recruiting'),false);
 assert.equal(canAccess('manager','/employees-malicious'),false);
});
test('employee and department visibility cannot expand to other staff',()=>{
 const all=[{id:'1',department:'A'},{id:'2',department:'A'},{id:'3',department:'B'}] as Employee[];
 assert.deepEqual(visibleEmployees(all,'employee',{id:'1',department:'A'}).map(e=>e.id),['1']);
 assert.deepEqual(visibleEmployees(all,'manager',{id:'1',department:'A'}).map(e=>e.id),['1','2']);
 assert.equal(visibleEmployees(all,'hr',{id:'1',department:'A'}).length,3);
});
test('salary reconciles overtime, leave, estimated tax and net pay',()=>{
 const r=calculateSalary({employee_id:'1',base:17400,performance:2000,subsidy:500,status:'pending'},8,1);
 assert.deepEqual(r,{overtimePay:1200,deduction:800,gross:20300,tax:1530,net:18770});
 const low=calculateSalary({employee_id:'1',base:4000,performance:0,subsidy:0,status:'pending'},0,0);
 assert.equal(low.tax,0);assert.equal(low.net,4000);
});
test('grade boundaries are inclusive at 60, 75 and 90',()=>{
 assert.deepEqual([0,59,60,74,75,89,90,100].map(scoreToGrade),['D','D','C','C','B','B','A','A']);
});
