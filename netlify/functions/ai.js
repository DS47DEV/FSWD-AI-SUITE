const headers={"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"same-origin"};
const respond=(status,obj)=>({statusCode:status,headers,body:JSON.stringify(obj)});
exports.handler=async(event)=>{
 if(event.httpMethod!=="POST")return respond(405,{error:"Méthode non autorisée"});
 if((event.body||"").length>35000)return respond(413,{error:"Requête trop volumineuse"});
 const project=process.env.SUPABASE_URL,anon=process.env.SUPABASE_ANON_KEY;
 if(!project||!anon)return respond(503,{error:"Authentification non configurée sur Netlify"});
 let url;try{url=new URL(project);if(url.protocol!=="https:")throw Error()}catch{return respond(500,{error:"SUPABASE_URL invalide"})}
 const token=(event.headers.authorization||event.headers.Authorization||"").match(/^Bearer (.+)$/i)?.[1];
 if(!token)return respond(401,{error:"Connexion requise"});
 let identity;
 try{const r=await fetch(project.replace(/\/$/,"")+"/auth/v1/user",{headers:{apikey:anon,authorization:"Bearer "+token},signal:AbortSignal.timeout(8000)});if(!r.ok)return respond(401,{error:"Session expirée ou invalide"});identity=await r.json();if(!identity.id)return respond(401,{error:"Session invalide"})}catch{return respond(503,{error:"Service d’authentification indisponible"})}
 let p;try{p=JSON.parse(event.body||"{}")}catch{return respond(400,{error:"JSON invalide"})}
 if(!["chat","content","document"].includes(p.mode))return respond(400,{error:"Mode inconnu"});
 let messages=[];
 if(p.mode==="chat"){
  if(!Array.isArray(p.messages)||p.messages.length>12)return respond(400,{error:"Historique invalide"});
  messages=p.messages.filter(m=>["user","assistant"].includes(m.role)&&typeof m.text==="string"&&m.text.length<=2000).map(m=>({role:m.role,content:m.text}));
  if(!messages.length||messages.at(-1).role!=="user")return respond(400,{error:"Message manquant"});
 }else if(p.mode==="content"){
  if(!["post","email","product"].includes(p.type)||typeof p.subject!=="string"||typeof p.audience!=="string"||p.subject.length>140||p.audience.length>140)return respond(400,{error:"Champs invalides"});
  messages=[{role:"user",content:`Rédige en français un ${p.type} pour le sujet « ${p.subject} » destiné à « ${p.audience} ». Ne fabrique pas de faits commerciaux.`}];
 }else{
  if(typeof p.text!=="string"||!p.text.trim()||p.text.length>12000)return respond(400,{error:"Texte invalide (12 000 caractères max)"});
  messages=[{role:"user",content:"Résume ce texte en français et indique les points importants sans inventer :\n\n"+p.text}];
 }
 const key=process.env.AI_API_KEY,model=process.env.AI_MODEL,base=process.env.AI_BASE_URL;
 if(!key||!model||!base)return respond(200,{text:"Mode démonstration : configurez l’API IA côté Netlify pour activer la génération réelle.",demo:true});
 // Limitation atomique dans Postgres avant tout appel facturable ; échoue en mode fermé.
 try{const r=await fetch(project.replace(/\/$/,"")+"/rest/v1/rpc/consume_ai_quota",{method:"POST",headers:{apikey:anon,authorization:"Bearer "+token,"content-type":"application/json"},body:"{}",signal:AbortSignal.timeout(8000)});if(!r.ok)return respond(503,{error:"Contrôle du quota indisponible ; aucune requête IA lancée"});const result=await r.json();if(result!==true)return respond(429,{error:"Quota atteint : 10 requêtes par jour et 1 par minute par compte"})}catch{return respond(503,{error:"Contrôle du quota indisponible"})}
 let api;try{api=new URL(base);if(api.protocol!=="https:")throw Error()}catch{return respond(500,{error:"AI_BASE_URL doit être une URL HTTPS valide"})}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const r=await fetch(api.toString().replace(/\/$/,"")+"/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"system",content:"Tu es un assistant professionnel utile. Réponds en français. N’invente pas de faits."},...messages],max_tokens:700}),signal:controller.signal});if(!r.ok)return respond(502,{error:"Fournisseur IA indisponible (HTTP "+r.status+"). Vérifiez configuration et crédits."});const result=await r.json(),text=result?.choices?.[0]?.message?.content;if(typeof text!=="string")return respond(502,{error:"Réponse IA inattendue"});return respond(200,{text,demo:false})}catch(e){return respond(502,{error:e.name==="AbortError"?"Délai IA dépassé":"Connexion IA impossible"})}finally{clearTimeout(timer)}
};
