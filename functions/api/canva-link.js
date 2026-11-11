const validCanva = value => {
  try { const u = new URL(value); return u.protocol === 'https:' && (u.hostname === 'canva.com' || (u.hostname.endsWith('.canva.com') && u.hostname.split('.').length === 3)) && u.pathname.startsWith('/') && !u.username && !u.password; }
  catch { return false; }
};
export async function onRequestGet({request,env}) {
  const base=(env.SUPABASE_URL||'').replace(/\/$/,''); const key=env.SUPABASE_ANON_KEY;
  if(!base||!key)return Response.json({error:'Canva invite is not configured'},{status:503});
  const headers={apikey:key,Authorization:`Bearer ${key}`};
  const [lr,tr]=await Promise.all([
    fetch(`${base}/rest/v1/links?id=eq.1&select=url,updated_at`,{headers}),
    fetch(`${base}/rest/v1/canva_settings?id=eq.1&select=task1_url,task2_url`,{headers})
  ]);
  if(!lr.ok||!tr.ok)return Response.json({error:'Canva invite is temporarily unavailable'},{status:503});
  const links=await lr.json(),tasks=await tr.json(),link=links[0],task=tasks[0];
  if(!link||!validCanva(link.url)||!task?.task1_url||!task?.task2_url)return Response.json({error:'Canva invite is not ready yet'},{status:503});
  if(new URL(request.url).searchParams.get('redirect')==='1')return Response.redirect(link.url,302);
  return Response.json({updated_at:link.updated_at,task1_url:task.task1_url,task2_url:task.task2_url},{headers:{'Cache-Control':'public, max-age=60','X-Robots-Tag':'noindex'}});
}
