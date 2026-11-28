import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDaycare } from '@/lib/daycare-store';
import { useT } from '@/i18n/useT';
export function LanguageSelect(){const {state,updateSettings}=useDaycare(),{t}=useT();return <div><Label htmlFor="language" className="mb-2 block">{t('Language')}</Label><Select value={state.settings.language} onValueChange={value=>{if(value==='en'||value==='fr'||value==='ar')updateSettings({language:value});}}><SelectTrigger id="language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="fr">Français</SelectItem><SelectItem value="ar">العربية</SelectItem></SelectContent></Select></div>;}
