import type {Salary} from '../types.ts';
export function calculateSalary(s:Salary,overtime:number,leave:number){
  const overtimePay=Math.round(overtime*s.base/21.75/8*1.5);
  const deduction=Math.round(leave*s.base/21.75);
  const gross=s.base+s.performance+s.subsidy+overtimePay-deduction;
  const tax=Math.round(Math.max(0,gross-5000)*.1);
  return {overtimePay,deduction,gross,tax,net:gross-tax};
}
export const scoreToGrade=(v:number)=>v>=90?'A':v>=75?'B':v>=60?'C':'D';
