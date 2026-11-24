export type Role = 'employee'|'manager'|'hr'|'hr_lead'|'boss';
export interface Employee {id:string;name:string;department:string;position:string;status:string;hire_date:string;contract_end:string;email:string;phone:string;identity:string;emergency:string;bank:string;address:string;manager:string;location:string}
export interface Step {role:string;name:string;status:string;time:string|null;comment:string|null}
export interface Flow {id:string;type:string;status:string;employee_id:string;employee_name:string;initiator:string;created_at:string;current_approver:string;data:Record<string,string>;steps:Step[]}
export interface Contract {id:string;employee_id:string;employee_name:string;type:string;start_date:string;end_date:string;sign_status:string;file_url:string|null}
export interface Attendance {employee_id:string;employee_name:string;department:string;scheduled_days:number;actual_days:number;late_count:number;early_leave:number;leave_days:{sick:number;personal:number;annual:number};overtime_hours:number;absent_days:number}
export interface Salary {employee_id:string;base:number;performance:number;subsidy:number;status:string}
export interface Request {id:string;employee_id:string;type:string;title:string;start_date:string;end_date:string;reason:string;status:string;created_at:string}
export interface Job {id:string;title:string;department:string;headcount:number;status:string;applied:number;interviewing:number;hired:number;created_at:string;description:string;requirements:string;location:string;salary_range:string}
export interface Candidate {id:string;name:string;job_id:string;source:string;stage:string;rating:number;created_at?:string;last_updated:string;phone:string;summary:string;notes:string}
export interface Interview {id:string;candidate_id:string;interviewer:string;round:string;time:string;mode:string;location:string;status:string}
export interface Cycle {id:string;name:string;start:string;end:string;stage:string;score_type:string;coverage:string;headcount:number;kpi:number;attitude:number;deadlines:string[]}
export interface Review {id:string;cycle_id:string;employee_id:string;self_score:number|null;manager_score:number|null;final_score:number|null;grade:string|null;submitted:boolean;manager_submitted?:boolean;self_metrics?:number[];manager_metrics?:number[];comment:string}
