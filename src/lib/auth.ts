const KEY='littleoak-password-v1';
const SESSION='littleoak-unlocked';
async function digest(password: string, salt: string) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
  return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export function isDefaultPassword() { return !localStorage.getItem(KEY); }
export async function verifyPassword(password: string): Promise<boolean> {
  const raw=localStorage.getItem(KEY);
  let valid=false;
  if(!raw) valid=password==='password123';
  else { const record=JSON.parse(raw) as {salt:string;hash:string}; valid=await digest(password,record.salt)===record.hash; }
  if(valid) sessionStorage.setItem(SESSION,'yes');
  return valid;
}
export async function changePassword(current: string, next: string): Promise<boolean> {
  if(next.length<8 || !await verifyPassword(current)) return false;
  if(next==='password123') {localStorage.removeItem(KEY);return true;}
  const salt=crypto.randomUUID();
  localStorage.setItem(KEY,JSON.stringify({salt,hash:await digest(next,salt)}));
  return true;
}
export const isLoggedIn=()=>sessionStorage.getItem(SESSION)==='yes';
export const logout=()=>sessionStorage.removeItem(SESSION);
