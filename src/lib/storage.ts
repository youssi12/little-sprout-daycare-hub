import { z } from 'zod';
import { emptyState } from './daycare-seed';
import type { DaycareState } from './daycare-types';
const text = z.string();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v);
const amount = z.number().int().nonnegative().max(100000000);
const child = z.object({id:text,firstName:text.min(1),lastName:text.min(1),birthDate:date,classroomId:text,allergies:z.array(text),medicalNotes:text,parentName:text,parentPhone:text,parentEmail:text,emergencyName:text,emergencyPhone:text,authorizedPickups:z.array(text),monthlyFee:amount,vaccinations:z.array(z.object({name:text,dueDate:date}))});
export const stateSchema = z.object({
  settings:z.object({name:text.trim().min(1),phone:text,email:text,language:z.enum(['en','fr','ar'])}),
  children:z.array(child),classrooms:z.array(z.object({id:text,name:text.trim().min(1),ageRange:text,capacity:z.number().int().min(1).max(1000)})),
  staff:z.array(z.object({id:text,name:text,role:z.enum(['director','lead-teacher','teacher','assistant','cook']),phone:text,classroomId:text,shift:text,days:z.array(z.enum(['sun','mon','tue','wed','thu','fri','sat']))})),
  attendance:z.array(z.object({id:text,childId:text,date,status:z.enum(['present','expected','absent','checked-out']),checkInAt:text.optional(),checkOutAt:text.optional(),droppedOffBy:text.optional(),pickedUpBy:text.optional()})),
  payments:z.array(z.object({id:text,childId:text,month:text.regex(/^\d{4}-(0[1-9]|1[0-2])$/),amount,installments:z.array(z.object({id:text,amount:amount.refine(v=>v>0),date,method:z.enum(['cash','transfer']),note:text}))})),
  reports:z.array(z.object({id:text,childId:text,date,meals:text,mealAmount:z.enum(['all','most','some','none']),napMinutes:z.number().min(0).max(600),mood:z.enum(['happy','calm','sleepy','fussy']),activities:text,notes:text})),
  inventory:z.array(z.object({id:text,name:text,category:z.enum(['toys','food','supplies']),quantity:z.number().nonnegative(),threshold:z.number().nonnegative(),unit:text})),
}).superRefine((s,ctx)=>{
  const fail = () => ctx.addIssue({code:'custom',message:'Invalid references or duplicate records'});
  for (const rows of [s.children,s.classrooms,s.staff,s.attendance,s.payments,s.reports,s.inventory]) if(new Set(rows.map(r=>r.id)).size!==rows.length) fail();
  const rooms=new Set(s.classrooms.map(r=>r.id)),kids=new Set(s.children.map(c=>c.id));
  if(s.children.some(c=>!rooms.has(c.classroomId)) || s.staff.some(c=>c.classroomId && !rooms.has(c.classroomId))) fail();
  if([...s.attendance,...s.payments,...s.reports].some(r=>!kids.has(r.childId))) fail();
  if(new Set(s.payments.map(p=>`${p.childId}|${p.month}`)).size!==s.payments.length) fail();
  if(s.payments.some(p=>p.installments.reduce((sum,i)=>sum+i.amount,0)>p.amount || new Set(p.installments.map(i=>i.id)).size!==p.installments.length)) fail();
});
const KEY='littleoak-daycare-v2';
export async function loadState(): Promise<DaycareState> {
  const raw=localStorage.getItem(KEY);
  if(!raw) return emptyState();
  return stateSchema.parse(JSON.parse(raw));
}
export async function saveState(state: DaycareState): Promise<void> { localStorage.setItem(KEY,JSON.stringify(stateSchema.parse(state))); }
export function createBackup(state: DaycareState) { return { version:2,exportDate:new Date().toISOString(),state:stateSchema.parse(state) }; }
export function parseBackup(value: unknown): DaycareState {
  return z.object({version:z.literal(2),exportDate:z.string().datetime(),state:stateSchema}).parse(value).state;
}
