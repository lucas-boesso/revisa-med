/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import {FormEvent,useCallback,useEffect,useRef,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {BookOpen,CheckCircle2,Cloud,Eye,EyeOff,LoaderCircle,LockKeyhole,Mail,ShieldCheck} from 'lucide-react';
import {RevisaApp} from '@/components/revisa-app';
import {demo} from '@/lib/demo-data';
import {defaults,Settings,Topic} from '@/lib/review-algorithm';
import {getSupabase,loadCloudState,saveCloudState,StudyState} from '@/lib/supabase';

const legacyKey='revisa-med-v1';
type SyncStatus='Salvo na nuvem'|'Salvando...'|'Sem conexão'|'Erro ao salvar';

export default function Home(){
  const client=getSupabase();
  const [session,setSession]=useState<Session|null|undefined>(undefined);
  const [initial,setInitial]=useState<StudyState|null>(null);
  const [syncStatus,setSyncStatus]=useState<SyncStatus>('Salvo na nuvem');
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const latestState=useRef<StudyState|null>(null);

  useEffect(()=>{
    if(!client){setSession(null);return}
    client.auth.getSession().then(({data})=>setSession(data.session));
    const {data}=client.auth.onAuthStateChange((_event,next)=>{setSession(next);if(!next)setInitial(null)});
    return()=>data.subscription.unsubscribe();
  },[client]);

  useEffect(()=>{
    if(!session)return;
    let active=true;
    (async()=>{
      try{
        let state=await loadCloudState(session.user.id);
        if(!state){
          const cached=localStorage.getItem(legacyKey);
          try{const parsed=cached?JSON.parse(cached):null;state=parsed?.topics&&parsed?.settings?{topics:parsed.topics,settings:parsed.settings,schemaVersion:1}:{topics:demo,settings:defaults,schemaVersion:1}}catch{state={topics:demo,settings:defaults,schemaVersion:1}}
          await saveCloudState(session.user.id,state);
        }
        if(active){latestState.current=state;localStorage.setItem(`${legacyKey}:${session.user.id}`,JSON.stringify(state));setInitial(state)}
      }catch{
        const cached=localStorage.getItem(`${legacyKey}:${session.user.id}`);
        if(active){const parsed=cached?JSON.parse(cached):{topics:demo,settings:defaults};const fallback={...parsed,schemaVersion:1 as const};latestState.current=fallback;setInitial(fallback);setSyncStatus(navigator.onLine?'Erro ao salvar':'Sem conexão')}
      }
    })();
    return()=>{active=false};
  },[session]);

  const handleStateChange=useCallback((topics:Topic[],settings:Settings)=>{
    if(!session)return;
    const state:StudyState={topics,settings,schemaVersion:1};
    latestState.current=state;
    localStorage.setItem(`${legacyKey}:${session.user.id}`,JSON.stringify(state));
    setSyncStatus(navigator.onLine?'Salvando...':'Sem conexão');
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(async()=>{try{await saveCloudState(session.user.id,state);setSyncStatus('Salvo na nuvem')}catch{setSyncStatus(navigator.onLine?'Erro ao salvar':'Sem conexão')}},700);
  },[session]);

  useEffect(()=>{
    if(!session)return;
    const retry=async()=>{if(!latestState.current)return;setSyncStatus('Salvando...');try{await saveCloudState(session.user.id,latestState.current);setSyncStatus('Salvo na nuvem')}catch{setSyncStatus('Erro ao salvar')}};
    const offline=()=>setSyncStatus('Sem conexão');
    window.addEventListener('online',retry);window.addEventListener('offline',offline);
    return()=>{window.removeEventListener('online',retry);window.removeEventListener('offline',offline);if(timer.current)clearTimeout(timer.current)};
  },[session]);

  if(!client)return <SetupRequired/>;
  if(session===undefined)return <Loading text='Verificando sua sessão...'/>
  if(!session)return <AuthScreen/>;
  if(!initial)return <Loading text='Sincronizando seus estudos...'/>
  return <RevisaApp initialTopics={initial.topics} initialSettings={initial.settings} onStateChange={handleStateChange} syncStatus={syncStatus} userEmail={session.user.email||'Conta conectada'} onSignOut={()=>client.auth.signOut()}/>;
}

function AuthScreen(){
  const client=getSupabase()!;const [mode,setMode]=useState<'login'|'signup'>('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');const result=mode==='login'?await client.auth.signInWithPassword({email,password}):await client.auth.signUp({email,password});setBusy(false);if(result.error){setError(translateAuthError(result.error.message));return}if(mode==='signup'&&!result.data.session)setMessage('Conta criada. Confirme o acesso pelo e-mail enviado para você.')}
  return <main className='auth-page'><section className='auth-intro'><div className='auth-brand'><span>R</span><b>Revisa.med</b></div><div><p className='eyebrow'>REVISÃO ADAPTATIVA</p><h1>Seu progresso acompanha você.</h1><p>Registre questões no celular e continue no tablet ou computador com o mesmo calendário.</p><ul><li><Cloud/>Sincronização automática</li><li><ShieldCheck/>Dados separados por usuário</li><li><BookOpen/>Algoritmo transparente</li></ul></div><small>Preparado para estudos de residência médica.</small></section><section className='auth-panel'><form className='auth-card' onSubmit={submit}><div className='auth-icon'><LockKeyhole/></div><h2>{mode==='login'?'Entrar na sua conta':'Criar sua conta'}</h2><p>{mode==='login'?'Acesse suas revisões em qualquer dispositivo.':'Seus dados serão protegidos e sincronizados.'}</p>{error&&<div className='auth-error'>{error}</div>}{message&&<div className='auth-success'><CheckCircle2/>{message}</div>}<label>E-mail<div className='auth-input'><Mail/><input type='email' required autoComplete='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='voce@exemplo.com'/></div></label><label>Senha<div className='auth-input'><LockKeyhole/><input type={show?'text':'password'} required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder='Mínimo de 6 caracteres'/><button type='button' onClick={()=>setShow(!show)} aria-label={show?'Ocultar senha':'Mostrar senha'}>{show?<EyeOff/>:<Eye/>}</button></div></label><button className='primary auth-submit' disabled={busy}>{busy?<LoaderCircle className='spin'/>:mode==='login'?'Entrar':'Criar conta'}</button><button type='button' className='auth-switch' onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?'Ainda não tenho uma conta':'Já tenho uma conta'}</button></form></section></main>
}

function Loading({text}:{text:string}){return <main className='center-state'><div className='brandmark'>R</div><LoaderCircle className='spin'/><p>{text}</p></main>}
function SetupRequired(){return <main className='center-state setup'><div className='brandmark'>R</div><h1>Conecte o banco de dados</h1><p>Copie <code>.env.example</code> para <code>.env.local</code> e informe a URL e a chave pública do seu projeto Supabase.</p><p>Depois, execute o arquivo <code>supabase/schema.sql</code> no editor SQL do Supabase.</p></main>}
function translateAuthError(message:string){if(message.includes('Invalid login'))return'E-mail ou senha incorretos.';if(message.includes('already registered'))return'Este e-mail já possui uma conta.';if(message.includes('Password'))return'A senha precisa ter pelo menos 6 caracteres.';return message}
