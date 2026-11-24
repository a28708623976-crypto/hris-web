import {create} from 'zustand';
import {visibleEmployees} from '../utils/permissions';
import {persist} from 'zustand/middleware';
import employees from '../mock/employees.json';import contracts from '../mock/contracts.json';import lifecycle from '../mock/lifecycle.json';import attendance from '../mock/attendance.json';import salary from '../mock/salary.json';import selfService from '../mock/self-service.json';import recruiting from '../mock/recruiting.json';import performance from '../mock/performance.json';
import type {Employee,Contract,Flow,Attendance,Salary,Request,Job,Candidate,Interview,Cycle,Review,Role} from '../types';
interface Data {employees:Employee[];contracts:Contract[];flows:Flow[];attendance:Attendance[];salaries:Record<string,Salary[]>;requests:Request[];jobs:Job[];candidates:Candidate[];interviews:Interview[];cycles:Cycle[];reviews:Review[];payments:{month:string;date:string;count:number;total:number;operator:string}[];certificates:{id:string;name:string;type:string;time:string}[]}
const seed:Data={employees,contracts,flows:lifecycle as Flow[],attendance:attendance.records,salaries:{[attendance.month]:salary},requests:selfService.my_requests,jobs:recruiting.jobs,candidates:recruiting.candidates,interviews:recruiting.interviews,cycles:performance.cycles,reviews:performance.reviews,payments:[],certificates:[]};
interface State extends Data {role:Role;loggedIn:boolean;setRole:(role:Role)=>void;login:()=>void;logout:()=>void;update:(data:Partial<Data>)=>void;toast:string;notify:(s:string)=>void}
let timer:ReturnType<typeof setTimeout>;
export const useStore=create<State>()(persist((set)=>({...seed,role:'hr_lead',loggedIn:true,setRole:(role)=>set({role}),login:()=>set({loggedIn:true}),logout:()=>set({loggedIn:false}),update:(data)=>set(data),toast:'',notify:(toast)=>{clearTimeout(timer);set({toast});timer=setTimeout(()=>set({toast:''}),3500)}}),{name:'isleon-hris-demo-v1',partialize:({toast,...state})=>state}));
export function useIdentity(){
 const role=useStore(s=>s.role),employees=useStore(s=>s.employees);
 const id=role==='employee'?'EMP001':role==='manager'?'EMP004':'EMP005';
 const e=employees.find(e=>e.id===id);
 return {id,name:e?.name||'演示用户',department:e?.department||''};
}
export function useVisibleEmployees(){
 const all=useStore(s=>s.employees),role=useStore(s=>s.role),me=useIdentity();
 return visibleEmployees(all,role,me);
}
