"use strict";
let sb;
(async function initAuth(){
 const gate=document.getElementById('authGate'),status=document.getElementById('authStatus');
 const cfg=window.FSWD_CONFIG||{};
 if(!window.supabase||!cfg.supabaseUrl||cfg.supabaseUrl.includes('REMPLACER')||!cfg.supabaseAnonKey||cfg.supabaseAnonKey.includes('REMPLACER')){
  status.textContent='Configurez config.js avec l’URL et la clé publique Supabase pour activer la connexion.';
  document.getElementById('authForm').querySelectorAll('button').forEach(b=>b.disabled=true);return;
 }
 sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 async function refresh(){const {data:{session}}=await sb.auth.getSession();gate.hidden=!!session;document.getElementById('accountEmail').textContent=session?.user?.email||'Non connecté';
  // Les données du prototype restent locales, séparées par utilisateur.
  const userKey='fswd-ai-suite-v3-'+(session?.user?.id||'guest');
  if(window.__lastFSWDUserKey!==userKey){window.__lastFSWDUserKey=userKey;
   if(session){try{const saved=JSON.parse(localStorage.getItem(userKey));data=saved&&Array.isArray(saved.messages)&&Array.isArray(saved.contents)&&Array.isArray(saved.tasks)&&Array.isArray(saved.history)?saved:structuredClone(initial)}catch{data=structuredClone(initial)}}else{data=structuredClone(initial)}
   renderStats();renderMessages();renderTasks();renderHistory();}
 }
 // Le code V2 sauvegarde sous KEY ; miroir isolé par compte et non synchronisé entre appareils.
 const originalSave=save;save=function(){if(!sb)return;sb.auth.getUser().then(({data:{user}})=>{if(user)localStorage.setItem('fswd-ai-suite-v3-'+user.id,JSON.stringify(data))}).catch(()=>{});};
 document.getElementById('authForm').addEventListener('submit',async e=>{e.preventDefault();status.textContent='Connexion…';const {error}=await sb.auth.signInWithPassword({email:document.getElementById('authEmail').value.trim(),password:document.getElementById('authPassword').value});status.textContent=error?error.message:'';if(!error)await refresh()});
 document.getElementById('signUp').onclick=async()=>{status.textContent='Création…';const {data,error}=await sb.auth.signUp({email:document.getElementById('authEmail').value.trim(),password:document.getElementById('authPassword').value,options:{emailRedirectTo:location.origin}});status.textContent=error?error.message:(data.session?'Compte créé.':'Vérifiez votre e-mail pour confirmer le compte.')};
 document.getElementById('logout').onclick=async()=>{await sb.auth.signOut();await refresh()};
 sb.auth.onAuthStateChange(()=>{setTimeout(refresh,0)});await refresh();
})();
