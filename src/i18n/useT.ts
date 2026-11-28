import { useDaycare } from '@/lib/daycare-store';
import en from './en';
import fr from './fr';
import ar from './ar';
import type { Language } from '@/lib/daycare-types';
const dictionaries={en,fr,ar};
export function translate(language:Language,key:string,values:Record<string,string|number>={}) {
  return (dictionaries[language][key]??en[key]??key).replace(/\{(\w+)\}/g,(_,name:string)=>String(values[name]??`{${name}}`));
}
export function useT(){const {state}=useDaycare();const language=state.settings.language;return {language,dir:language==='ar'?'rtl' as const:'ltr' as const,t:(key:string,values?:Record<string,string|number>)=>translate(language,key,values)};}
