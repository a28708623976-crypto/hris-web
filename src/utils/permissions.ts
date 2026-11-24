import type {Role, Employee} from '../types.ts';
export function canAccess(role:Role,path:string){
  if(path.startsWith('/self-service')||path==='/403')return true;
  if(path.includes('/salary')||path.includes('salary_adjust'))return ['hr_lead','boss'].includes(role);
  if(role==='employee')return path==='/attendance'||path==='/performance'||path.startsWith('/performance/review/');
  if(role==='manager')return ['/employees','/lifecycle','/attendance','/performance'].some(p=>path===p||path.startsWith(p+'/'));
  return true;
}
export function visibleEmployees(all:Employee[],role:Role,me:{id:string;department:string}){
  return all.filter(e=>role==='employee'?e.id===me.id:role==='manager'?e.department===me.department:true);
}
