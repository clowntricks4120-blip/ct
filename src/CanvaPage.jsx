import React,{useEffect,useState} from 'react';
import {AlertTriangle,ArrowLeft,CheckCircle2,Clock,ExternalLink,Flag,LoaderCircle,ShieldCheck} from 'lucide-react';
import {Link} from 'react-router-dom';
import {usePageSEO} from './seo';
import './canva.css';

const API='/api/canva-link';
const isHttpsUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'}catch{return false}};

export default function CanvaPage(){
  usePageSEO({title:'Canva Pro Team Invite',description:'Complete two short website visits to continue to the Canva team invite.',noindex:true});
  const [config,setConfig]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [step,setStep]=useState(()=>Number(sessionStorage.getItem('ct-canva-step')||0));
  const [waiting,setWaiting]=useState(false),[opened,setOpened]=useState(false),[seconds,setSeconds]=useState(15),[reporting,setReporting]=useState(false),[reportMsg,setReportMsg]=useState('');
  useEffect(()=>{let alive=true;fetch(API,{headers:{Accept:'application/json'}}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Canva link is temporarily unavailable');return d}).then(d=>{if(alive)setConfig(d)}).catch(e=>{if(alive)setError(e.message)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[]);
  useEffect(()=>{sessionStorage.setItem('ct-canva-step',String(step))},[step]);
  useEffect(()=>{if(!opened)return;let leftPage=false;const onVisibility=()=>{if(document.visibilityState==='hidden')leftPage=true;else if(leftPage){setOpened(false);setWaiting(true)}};const onFocus=()=>{if(leftPage){setOpened(false);setWaiting(true)}};document.addEventListener('visibilitychange',onVisibility);window.addEventListener('focus',onFocus);return()=>{document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('focus',onFocus)}},[opened]);
  useEffect(()=>{if(!waiting)return;setSeconds(15);const end=Date.now()+15000;const timer=setInterval(()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));setSeconds(left);if(left===0){clearInterval(timer);setWaiting(false);setStep(v=>Math.min(2,v+1))}},250);return()=>clearInterval(timer)},[waiting]);
  const tasks=[config?.task1_url,config?.task2_url];
  function openTask(){const url=tasks[step];if(!isHttpsUrl(url))return;window.open(url,'_blank','noopener,noreferrer');setOpened(true)}
  async function report(){setReporting(true);setReportMsg('');try{const r=await fetch('/api/canva-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reason:'Invite link reported as broken'})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not submit report');setReportMsg('Thanks. Your report has been received.')}catch(e){setReportMsg(e.message)}finally{setReporting(false)}}
  return <main className="canva-wrap"><Link className="canva-back" to="/"><ArrowLeft size={16}/> Back to Clown Tricks</Link><section className="canva-card">
    <div className="canva-brand"><span className="canva-logo">C</span><span>CANVA PRO ACCESS</span></div>
    <h1>Continue to Canva</h1><p className="canva-intro">Complete the two quick website visits below. After each visit, return here and wait 15 seconds to unlock the next step.</p>
    <div className="canva-progress"><span className={step>=1?'done':''}>1</span><i className={step>=1?'done':''}/><span className={step>=2?'done':''}>2</span><i className={step>=2?'done':''}/><span className={step>=2?'done':''}>✓</span></div>
    {loading?<p className="canva-status"><LoaderCircle className="spin"/> Loading current invite…</p>:error?<div className="canva-error"><AlertTriangle/> {error}</div>:<>
      <div className="canva-task"><div><small>STEP {Math.min(step+1,2)} OF 2</small><h2>{step>=2?'All steps completed':`Website visit ${step+1}`}</h2><p>{step>=2?'Your Canva team invite is ready.':waiting?`Return here and wait ${seconds} seconds to complete this step.`:'Open the website in a new tab, then come back to this page.'}</p></div>
      {step<2?<button className="canva-primary" onClick={openTask} disabled={waiting||!isHttpsUrl(tasks[step])}>{waiting?<><Clock size={18}/> Wait {seconds}s</>:<>Open website <ExternalLink size={17}/></>}</button>:<a className="canva-primary" href="/api/canva-link?redirect=1" target="_blank" rel="noopener noreferrer nofollow"><ShieldCheck size={18}/> Continue to Canva <ExternalLink size={16}/></a>}</div>
      <p className="canva-updated">{config?.updated_at?`Invite last updated: ${new Date(config.updated_at).toLocaleString()}`:'Invite update time unavailable'}</p>
    </>}
    <div className="canva-warning"><AlertTriangle size={19}/><p><b>Important privacy notice</b><br/>This is a third-party team invite. Joining gives the team owner access to your name, email and designs in that team. Use a separate Canva account. Links may expire or stop working.</p></div>
    <div className="canva-report"><span>Invite link not working?</span><button onClick={report} disabled={reporting}><Flag size={15}/>{reporting?'Sending…':'Report broken link'}</button>{reportMsg&&<small role="status">{reportMsg}</small>}</div>
  </section><p className="canva-foot">Clown Tricks is not affiliated with Canva.</p></main>;
}
