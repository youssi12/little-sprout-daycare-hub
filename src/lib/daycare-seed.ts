import type { DaycareState, Settings } from './daycare-types';
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => todayISO().slice(0, 7);
export const defaultSettings: Settings = { name: 'Little Oak', phone: '', email: '', language: 'en' };
export function emptyState(settings: Settings = defaultSettings): DaycareState {
  return { settings: { ...settings }, classrooms: [
    { id: 'c1', name: 'Bébés', ageRange: '0–2', capacity: 10 },
    { id: 'c2', name: 'Petits', ageRange: '2–3', capacity: 14 },
    { id: 'c3', name: 'Grands', ageRange: '3–5', capacity: 16 },
  ], children: [], staff: [], attendance: [], payments: [], reports: [], inventory: [] };
}
export function seedState(settings: Settings = defaultSettings): DaycareState {
  const state = emptyState(settings), today = todayISO(), month = currentMonth();
  const names = [ ['Yacine','Benali','Nadia Benali','Karim Benali'], ['Lina','Boudiaf','Amel Boudiaf','Samir Boudiaf'], ['آدم','بوقرة','سارة بوقرة','مراد بوقرة'], ['Inès','Mansouri','Leïla Mansouri','Rachid Mansouri'], ['Amir','Haddad','Souad Haddad','Nabil Haddad'], ['مريم','بن سعيد','فاطمة بن سعيد','علي بن سعيد'], ['Aya','Cherif','Yasmine Cherif','Sofiane Cherif'], ['Ilyes','Bouzid','Khadidja Bouzid','Youcef Bouzid'], ['نور','بلقاسم','أمينة بلقاسم','محمد بلقاسم'], ['Rayan','Aït Ahmed','Djamila Aït Ahmed','Farid Aït Ahmed'] ];
  const ages = [30, 14, 7, 44, 36, 22, 57, 40, 11, 61];
  const fees = [15000, 22000, 25000, 14000, 15000, 20000, 12000, 16000, 23000, 13000];
  state.children = names.map((n, i) => {
    const age = ages[i] ?? 30, d = new Date(`${today}T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() - age);
    const due = new Date(`${today}T12:00:00Z`); due.setUTCDate(due.getUTCDate() + i * 7 - 3);
    return { id: `k${i+1}`, firstName: n[0] ?? '', lastName: n[1] ?? '', birthDate: d.toISOString().slice(0,10), classroomId: age < 24 ? 'c1' : age < 36 ? 'c2' : 'c3',
      parentName: n[2] ?? '', emergencyName: n[3] ?? '', parentPhone: `0${5+i%3} 55 00 10 ${String(i+10)}`, emergencyPhone: `0${7-i%3} 66 00 20 ${String(i+10)}`, parentEmail: `famille.${['benali','boudiaf','bouguerra','mansouri','haddad','bensaid','cherif','bouzid','belkacem','aitahmed'][i]}@example.com`,
      allergies: i === 0 ? ['Arachides'] : i === 3 ? ['Œufs'] : i === 5 ? ['Lait'] : [], medicalNotes: i === 0 ? 'Stylo auto-injecteur dans le sac. Contacter les parents en cas de réaction.' : i === 5 ? 'Lait sans lactose fourni par la famille.' : i === 7 ? 'Asthme : inhalateur dans le casier, selon ordonnance.' : '', authorizedPickups: [n[2] ?? '', n[3] ?? ''], monthlyFee: fees[i] ?? 15000,
      vaccinations: [{ name: age < 12 ? 'BCG / Hépatite B — vérification carnet' : age < 24 ? 'ROR — vérification carnet' : 'DTC-Polio — rappel selon carnet', dueDate: due.toISOString().slice(0,10) }] };
  });
  state.attendance = state.children.map((c,i) => ({ id:`a-${c.id}-${today}`, childId:c.id,date:today,status:i<6?'present':i===6?'checked-out':i===7?'absent':'expected', ...(i<7?{checkInAt:`08:${String(10+i*5).padStart(2,'0')}`,droppedOffBy:c.parentName}:{}), ...(i===6?{checkOutAt:'14:30',pickedUpBy:c.emergencyName}:{}) }));
  state.payments = state.children.map((c,i) => ({id:`p-${c.id}-${month}`,childId:c.id,month,amount:c.monthlyFee,installments:i%3===2?[]:[{id:`ip-${i}`,amount:i%3===0?c.monthlyFee:Math.round(c.monthlyFee/2),date:`${month}-05`,method:i%2===0?'cash':'transfer',note:''}]}));
  state.staff = [ ['Nadia Belkacem','director','c3'],['سميرة بن عمر','lead-teacher','c1'],['Amine Rahmani','teacher','c2'],['خديجة بوزيد','assistant','c1'],['Fatiha Meziane','cook','c3'] ].map((n,i)=>({ id:`s${i+1}`,name:n[0]??'',role:n[1]??'teacher',classroomId:n[2]??'',phone:`06 77 00 30 ${i+10}`,shift:i===4?'07:00 – 15:00':'08:00 – 16:00',days:['sun','mon','tue','wed','thu'] }));
  state.reports = [ {id:'r1',childId:'k1',date:today,meals:'Couscous aux légumes, compote de pommes',mealAmount:'most',napMinutes:60,mood:'happy',activities:'Peinture, jeux de construction',notes:'A partagé ses jouets avec ses camarades.'}, {id:'r2',childId:'k2',date:today,meals:'Purée de légumes, yaourt',mealAmount:'all',napMinutes:90,mood:'calm',activities:'Comptines, éveil sensoriel',notes:''} ];
  state.inventory = [['Couches taille 3','supplies',8,20,'paquets'],['Lingettes','supplies',34,15,'paquets'],['Lait infantile','food',6,10,'boîtes'],['Pommes','food',42,20,'pièces'],['Cubes de construction','toys',12,6,'lots'],['Papier à dessin','supplies',3,8,'ramettes'],['Puzzles','toys',18,8,'boîtes']].map((n,i)=>({id:`i${i+1}`,name:String(n[0]),category:n[1] as 'supplies'|'food'|'toys',quantity:Number(n[2]),threshold:Number(n[3]),unit:String(n[4])}));
  return state;
}
