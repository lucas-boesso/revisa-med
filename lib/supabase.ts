import {createClient, SupabaseClient} from '@supabase/supabase-js';
import type {Settings,Topic} from './review-algorithm';

export type StudyState={topics:Topic[];settings:Settings;schemaVersion:1};
let singleton:SupabaseClient|null|undefined;

export function getSupabase(){
  if(singleton!==undefined)return singleton;
  const viteEnv=(import.meta as ImportMeta&{env?:Record<string,string>}).env;
  const url=viteEnv?.VITE_SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=viteEnv?.VITE_SUPABASE_ANON_KEY??process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  singleton=url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
  return singleton;
}

export async function loadCloudState(userId:string){
  const client=getSupabase();if(!client)throw new Error('Supabase não configurado');
  const {data,error}=await client.from('study_states').select('topics,settings,schema_version').eq('user_id',userId).maybeSingle();
  if(error)throw error;
  return data?{topics:data.topics as Topic[],settings:data.settings as Settings,schemaVersion:1 as const}:null;
}

export async function saveCloudState(userId:string,state:StudyState){
  const client=getSupabase();if(!client)throw new Error('Supabase não configurado');
  const {error}=await client.from('study_states').upsert({user_id:userId,topics:state.topics,settings:state.settings,schema_version:state.schemaVersion,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)throw error;
}
