async function sha256(value){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function onRequestPost({request,env}){
  const base=(env.SUPABASE_URL||'').replace(/\/$/,'');const key=env.SUPABASE_ANON_KEY;
  if(!base||!key)return Response.json({error:'Reporting is temporarily unavailable'},{status:503});
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';const day=new Date().toISOString().slice(0,10);const ip_hash=await sha256(`${ip}:${env.REPORT_HASH_SALT||'ct-canva-report'}`);
  const r=await fetch(`${base}/rest/v1/rpc/record_canva_report`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({p_ip_hash:ip_hash,p_report_day:day})});
  if(!r.ok)return Response.json({error:'Could not submit report'},{status:502});const allowed=await r.json();
  if(!allowed)return Response.json({error:'You have already submitted the maximum reports for today'},{status:429});
  return Response.json({ok:true},{status:201,headers:{'Cache-Control':'no-store'}});
}
