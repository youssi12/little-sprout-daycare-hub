import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AttendanceRecord, Child, Classroom, DailyReport, DaycareState, Installment, InventoryItem, Settings, Staff } from './daycare-types';
import { currentMonth, emptyState, seedState, todayISO } from './daycare-seed';
import { loadState, saveState } from './storage';
import { addInstallment, childKey, deleteClassroom, ensureMonth } from './daycare-domain';
export { money, formatDate } from './daycare-domain';
interface Ctx {
  state: DaycareState; hydrated: boolean; storageError: boolean;
  addChild:(c:Omit<Child,'id'>)=>void; importChildren:(c:Omit<Child,'id'>[])=>number;
  updateChild:(id:string,patch:Partial<Child>)=>void; removeChild:(id:string)=>void;
  checkIn:(id:string,by:string)=>void; checkOut:(id:string,by:string)=>void; markAbsent:(id:string)=>void;
  recordPayment:(id:string,i:Omit<Installment,'id'>)=>void; deleteInstallment:(id:string,installmentId:string)=>void;
  addStaff:(s:Omit<Staff,'id'>)=>void; removeStaff:(id:string)=>void; addReport:(r:Omit<DailyReport,'id'>)=>void;
  adjustStock:(id:string,delta:number)=>void; addInventory:(i:Omit<InventoryItem,'id'>)=>void;
  updateSettings:(patch:Partial<Settings>)=>void; upsertClassroom:(r:Classroom)=>void; removeClassroom:(id:string)=>void;
  loadSample:()=>void; clearData:()=>void; restore:(s:DaycareState)=>void;
}
const DaycareContext=createContext<Ctx|null>(null);
const uid=()=>crypto.randomUUID();
const nowTime=()=>new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
export function DaycareProvider({children}:{children:ReactNode}) {
  const [state,setState]=useState<DaycareState>(()=>emptyState());
  const [hydrated,setHydrated]=useState(false),[storageError,setStorageError]=useState(false);
  useEffect(()=>{ let active=true; loadState().then(s=>{if(active){setState(ensureMonth(s,currentMonth()));setHydrated(true);}}).catch(()=>{if(active){setStorageError(true);setHydrated(true);}});return()=>{active=false;}; },[]);
  useEffect(()=>{if(!hydrated||storageError)return;void saveState(state).catch(()=>setStorageError(true));},[state,hydrated,storageError]);
  useEffect(()=>{ if(!hydrated)return; const tick=()=>setState(s=>ensureMonth(s,currentMonth())); const timer=setInterval(tick,60000); window.addEventListener('focus',tick); return()=>{clearInterval(timer);window.removeEventListener('focus',tick);}; },[hydrated]);
  const upsertAttendance=useCallback((childId:string,patch:Partial<AttendanceRecord>)=>setState(s=>{
    const date=todayISO(),existing=s.attendance.find(a=>a.childId===childId&&a.date===date),next={...(existing??{id:uid(),childId,date,status:'expected' as const}),...patch};
    return {...s,attendance:existing?s.attendance.map(a=>a.id===existing.id?next:a):[...s.attendance,next]};
  }),[]);
  const value=useMemo<Ctx>(()=>({state,hydrated,storageError,
    addChild:c=>{if(!state.classrooms.some(r=>r.id===c.classroomId))return;setState(s=>ensureMonth({...s,children:[...s.children,{...c,id:uid()}]},currentMonth()));},
    importChildren:rows=>{const keys=new Set(state.children.map(childKey)),valid=rows.filter(c=>{const key=childKey(c);if(keys.has(key)||!state.classrooms.some(r=>r.id===c.classroomId))return false;keys.add(key);return true;});setState(s=>ensureMonth({...s,children:[...s.children,...valid.map(c=>({...c,id:uid()}))]},currentMonth()));return valid.length;},
    updateChild:(id,patch)=>{if(patch.classroomId&&!state.classrooms.some(r=>r.id===patch.classroomId))return;setState(s=>({...s,children:s.children.map(c=>c.id===id?{...c,...patch}:c)}));},
    removeChild:id=>setState(s=>({...s,children:s.children.filter(c=>c.id!==id),attendance:s.attendance.filter(a=>a.childId!==id),payments:s.payments.filter(p=>p.childId!==id),reports:s.reports.filter(r=>r.childId!==id)})),
    checkIn:(id,by)=>upsertAttendance(id,{status:'present',checkInAt:nowTime(),droppedOffBy:by,checkOutAt:undefined,pickedUpBy:undefined}),
    checkOut:(id,by)=>upsertAttendance(id,{status:'checked-out',checkOutAt:nowTime(),pickedUpBy:by}),markAbsent:id=>upsertAttendance(id,{status:'absent'}),
    recordPayment:(id,i)=>{const p=state.payments.find(p=>p.id===id);if(!p)return;const next=addInstallment(p,{...i,id:uid()});setState(s=>({...s,payments:s.payments.map(p=>p.id===id?next:p)}));},
    deleteInstallment:(id,i)=>setState(s=>({...s,payments:s.payments.map(p=>p.id===id?{...p,installments:p.installments.filter(x=>x.id!==i)}:p)})),
    addStaff:st=>setState(s=>({...s,staff:[...s.staff,{...st,id:uid()}]})),removeStaff:id=>setState(s=>({...s,staff:s.staff.filter(x=>x.id!==id)})),
    addReport:r=>setState(s=>({...s,reports:[{...r,id:uid()},...s.reports]})),
    adjustStock:(id,delta)=>setState(s=>({...s,inventory:s.inventory.map(i=>i.id===id?{...i,quantity:Math.max(0,i.quantity+delta)}:i)})),addInventory:i=>setState(s=>({...s,inventory:[...s.inventory,{...i,id:uid()}]})),
    updateSettings:patch=>setState(s=>({...s,settings:{...s.settings,...patch}})),upsertClassroom:r=>setState(s=>({...s,classrooms:s.classrooms.some(c=>c.id===r.id)?s.classrooms.map(c=>c.id===r.id?r:c):[...s.classrooms,r]})),removeClassroom:id=>setState(deleteClassroom(state,id)),
    loadSample:()=>{setStorageError(false);setState(seedState(state.settings));},clearData:()=>{setStorageError(false);setState({...emptyState(state.settings),classrooms:state.classrooms});},restore:s=>{setStorageError(false);setState(ensureMonth(s,currentMonth()));},
  }),[state,hydrated,storageError,upsertAttendance]);
  return <DaycareContext.Provider value={value}>{children}</DaycareContext.Provider>;
}
export function useDaycare(){const ctx=useContext(DaycareContext);if(!ctx)throw new Error('DaycareProvider missing');return ctx;}
export function ageLabel(birthDate:string){const b=new Date(birthDate),now=new Date();let months=(now.getFullYear()-b.getFullYear())*12+now.getMonth()-b.getMonth();if(now.getDate()<b.getDate())months--;return `${Math.floor(months/12)} · ${months%12}`;}
export const initials=(first:string,last:string)=>`${first[0]??''}${last[0]??''}`.toUpperCase();
