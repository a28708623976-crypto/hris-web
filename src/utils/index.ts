import {differenceInCalendarDays,format,parseISO} from 'date-fns';
export const today=()=>format(new Date(),'yyyy-MM-dd');
export const monthNow=()=>format(new Date(),'yyyy-MM');
export const daysLeft=(date:string)=>differenceInCalendarDays(parseISO(date),new Date());
export const money=(v:number)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:0}).format(v);
export const uid=(prefix:string)=>`${prefix}${Date.now()}${Math.random().toString(36).slice(2,6)}`;
export const flowNames:Record<string,string>={onboard:'入职',confirm:'转正',transfer:'调岗',salary_adjust:'调薪',resign:'离职',renew:'合同续签'};
export const roles={employee:'员工',manager:'部门负责人',hr:'HR',hr_lead:'HR 主管',boss:'管理层'};
export function exportCSV(name:string,rows:Record<string,unknown>[]) {if(!rows.length)return; const escape=(v:unknown)=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';const keys=Object.keys(rows[0]);const text='\uFEFF'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(escape).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
