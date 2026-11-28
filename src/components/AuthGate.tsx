import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelect } from './LanguageSelect';
import { useDaycare } from '@/lib/daycare-store';
import { isLoggedIn, verifyPassword } from '@/lib/auth';
import { useT } from '@/i18n/useT';
export function AuthGate({children}:{children:ReactNode}) {
 const {state,hydrated}=useDaycare(),{t,language,dir}=useT();const [logged,setLogged]=useState(false),[password,setPassword]=useState(''),[error,setError]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=dir;},[language,dir]);
 useEffect(()=>{setLogged(isLoggedIn());const onLogout=()=>{setLogged(false);setPassword('');};window.addEventListener('daycare-logout',onLogout);return()=>window.removeEventListener('daycare-logout',onLogout);},[]);
 if(!hydrated)return <div className="grid min-h-screen place-items-center text-primary">{t('Checking…')}</div>;
 if(logged)return children;
 return <main className="grid min-h-screen place-items-center p-6"><section className="surface w-full max-w-sm overflow-hidden"><div className="rainbow-bar h-1.5"/><form className="space-y-5 p-7" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const valid=await verifyPassword(password);setLogged(valid);setError(!valid);setPassword('');}catch{setError(true);}finally{setBusy(false);}}}><img src="/favicon.png" alt="" className="mx-auto size-20"/><h1 className="text-center text-2xl font-bold">{state.settings.name}</h1><LanguageSelect/><div><Label htmlFor="password" className="mb-2 block">{t('Password')}</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>{error?<p role="alert" className="text-sm text-destructive">{t('Incorrect password')}</p>:null}<Button type="submit" className="w-full" disabled={busy}>{t(busy?'Checking…':'Sign in')}</Button><p className="text-center text-xs text-muted-foreground">{t('Offline device lock')}</p></form></section></main>;
}
