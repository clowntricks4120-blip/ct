import React,{useEffect,useState} from 'react';
import {AlertTriangle,ArrowLeft,CheckCircle2,ExternalLink,Flag,LoaderCircle,ShieldCheck} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import {usePageSEO} from './seo';
import AdSlot from './AdUnits';
import {supabase,configured} from './supabase';
import './canva.css';

const isHttpsUrl=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
const completed=()=>[1,2].filter(n=>sessionStorage.getItem(`ct-canva-task-${n}-done`)==='1').length;

export default function CanvaPage(){
  usePageSEO({title:'Canva Premium by Clown Tricks',description:'Complete two partner website visits to continue to the Canva team invite.',noindex:true});
  const [config,setConfig]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[step,setStep]=useState(completed),[reportMsg,setReportMsg]=useState('');
  useEffect(()=>{let alive=true;if(!configured){setError('Website configuration is incomplete. Please try again later.');setLoading(false);return}
    Promise.all([supabase.from('links').select('url,updated_at').eq('id',1).maybeSingle(),supabase.from('canva_settings').select('task1_url,task2_url').eq('id',1).maybeSingle()])
      .then(([l,t])=>{if(!alive)return;if(l.error||t.error)throw new Error('Canva invite is temporarily unavailable');if(!l.data?.url||!t.data?.task1_url||!t.data?.task2_url)throw new Error('Canva invite is not ready yet. Please check back later.');setConfig({...l.data,...t.data})})
      .catch(e=>{if(alive)setError(e.message)}).finally(()=>{if(alive)setLoading(false)});
    const sync=()=>setStep(completed());window.addEventListener('focus',sync);return()=>{alive=false;window.removeEventListener('focus',sync)};
  },[]);
  const tasks=[config?.task1_url,config?.task2_url];
  function report(){const subject=encodeURIComponent('Canva invite link report');const body=encodeURIComponent('The Canva invite link on Clown Tricks is not working.');window.location.href=`mailto:clowntricks@proton.me?subject=${subject}&body=${body}`;setReportMsg('Your email app will open so you can report this link.');}
  return <main className="canva-wrap"><Link className="canva-back" to="/"><ArrowLeft size={16}/> Back to Clown Tricks</Link>
    <AdSlot placement="canva-main-top" type="responsive"/>
    <section className="canva-card">
      <div className="canva-brand"><span className="canva-logo">C</span><span>BY CLOWN TRICKS</span></div>
      <h1>Canva Premium Access</h1><p className="canva-intro">Complete the two partner website visits below. Open each page, return here, and wait 15 seconds to complete the step.</p>
      <div className="canva-progress"><span className={step>=1?'done':''}>1</span><i className={step>=1?'done':''}/><span className={step>=2?'done':''}>2</span><i className={step>=2?'done':''}/><span className={step>=2?'done':''}>✓</span></div>
      {loading?<p className="canva-status"><LoaderCircle className="spin"/> Loading current invite…</p>:error?<div className="canva-error"><AlertTriangle/> {error}</div>:<>
        <div className="canva-task"><div><small>STEP {Math.min(step+1,2)} OF 2</small><h2>{step>=2?'All steps completed':'Partner website visit '+(step+1)}</h2><p>{step>=2?'Your Canva team invite is ready.':`Complete partner page ${step+1} to unlock the invite.`}</p></div>
          {step<2?<Link className="canva-primary" to={`/canva/task/${step+1}`}>Open page {step+1} <ExternalLink size={17}/></Link>:<a className="canva-primary" href={config.url} target="_blank" rel="noopener noreferrer nofollow"><ShieldCheck size={18}/> Continue to Canva <ExternalLink size={16}/></a>}
        </div>
        <p className="canva-updated">{config.updated_at?`Invite last updated: ${new Date(config.updated_at).toLocaleString()}`:'Invite update time unavailable'}</p>
      </>}
      <div className="canva-warning"><AlertTriangle size={19}/><p><b>Important privacy notice</b><br/>This is a third-party team invite. 500 Members only allowed in one team <br/> If Team Invite is full then try after some times <br/> Every 3hr Link Will Update <br/> Joining gives the team owner access to your name, email and designs in that team. Use a separate Canva account. Links may expire or stop working.</p></div>
      <div className="canva-report"><span>Invite link not working?</span><button onClick={report}><Flag size={15}/>Report broken link</button>{reportMsg&&<small role="status">{reportMsg}</small>}</div>
    </section>
    <AdSlot placement="canva-main-bottom" type="rectangle"/>
    <p className="canva-foot">Clown Tricks is not affiliated with Canva.</p></main>;
}

export function CanvaTaskPage(){
  usePageSEO({title:'Partner Visit | Canva Premium by Clown Tricks',description:'Complete this partner website visit to continue.',noindex:true});
  const {taskNumber: rawTaskNumber}=useParams();
  const taskNumber=Number(rawTaskNumber);
  const [url,setUrl]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[opened,setOpened]=useState(false),[waiting,setWaiting]=useState(false),[seconds,setSeconds]=useState(15),[done,setDone]=useState(()=>sessionStorage.getItem(`ct-canva-task-${taskNumber}-done`)==='1');
  useEffect(()=>{let alive=true;if(!configured){setError('Website configuration is incomplete.');setLoading(false);return}supabase.from('canva_settings').select('task1_url,task2_url').eq('id',1).maybeSingle().then(({data,error:e})=>{if(e)throw e;const value=data?.[`task${taskNumber}_url`];if(!isHttpsUrl(value))throw new Error('This partner page is not configured yet.');if(alive)setUrl(value)}).catch(e=>{if(alive)setError(e.message||'Unable to load partner page.')}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[taskNumber]);
  useEffect(()=>{if(!opened)return;let left=document.visibilityState==='hidden';const onBlur=()=>{left=true};const onVisibility=()=>{if(document.visibilityState==='hidden')left=true;else if(left){setOpened(false);setWaiting(true)}};const onFocus=()=>{if(left){setOpened(false);setWaiting(true)}};document.addEventListener('visibilitychange',onVisibility);window.addEventListener('blur',onBlur);window.addEventListener('focus',onFocus);return()=>{document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('blur',onBlur);window.removeEventListener('focus',onFocus)}},[opened]);
  useEffect(()=>{if(!waiting)return;setSeconds(15);const end=Date.now()+15000;const timer=setInterval(()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));setSeconds(left);if(left===0){clearInterval(timer);setWaiting(false);setDone(true);sessionStorage.setItem(`ct-canva-task-${taskNumber}-done`,'1')}},250);return()=>clearInterval(timer)},[waiting,taskNumber]);
  function openPartner(){if(!isHttpsUrl(url))return;window.open(url,'_blank','noopener,noreferrer');setOpened(true)}
  return <main className="canva-wrap"><Link className="canva-back" to="/canva"><ArrowLeft size={16}/> Back to Canva page</Link>
    <AdSlot placement={`canva-task-${taskNumber}-top`} type="responsive"/>
    <section className="canva-card"><div className="canva-brand"><span className="canva-logo">C</span><span>PARTNER VISIT {taskNumber} OF 2</span></div><h1>One quick website visit</h1><p className="canva-intro">Open the partner website in a new tab. After visiting, return here and wait 15 seconds.</p>
      {loading?<p className="canva-status"><LoaderCircle className="spin"/> Loading partner page…</p>:error?<div className="canva-error"><AlertTriangle/> {error}</div>:done?<div className="canva-task"><div><small><CheckCircle2 size={14}/> COMPLETED</small><h2>Visit completed</h2><p>You can return to the Canva page and continue.</p></div><Link className="canva-primary" to="/canva">Return to Canva <ArrowLeft size={16}/></Link></div>:<div className="canva-task"><div><small>PARTNER WEBSITE</small><h2>{waiting?'Please wait':'Ready to visit'}</h2><p>{waiting?`Your visit will be marked complete in ${seconds} seconds.`:'Open the partner website, then return to this tab.'}</p></div><button className="canva-primary" onClick={openPartner} disabled={waiting||opened}>{waiting?`Wait ${seconds}s`:<>Open website <ExternalLink size={17}/></>}</button></div>}
      <div className="canva-warning"><AlertTriangle size={19}/><p><b>Stay safe</b><br/>Clown Tricks does not control external partner websites. Do not enter passwords or payment details unless you trust the site.</p></div>
    </section>
    <AdSlot placement={`canva-task-${taskNumber}-bottom`} type="rectangle"/>
  </main>;
}
