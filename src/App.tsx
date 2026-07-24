import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { emptyDetails, id, load, save } from './store';
import type { Data, Project, TemplateId } from './types';
import { Builder } from './components/builder/Builder';
import { Upload } from './components/forms/ImageUpload';
import { Sidebar } from './components/navigation/Sidebar';
import type { PageId } from './config/navigation';
import { DRIVER_FIELDS, labelForDriverField } from './config/profile';
import { TEMPLATE_CATALOGUE } from './config/templates';
import {
  BrandingPage,
  HomePage,
  ProfilePage,
  SavedGraphicsPage,
  SponsorsPage,
  TemplateLibraryPage,
} from './pages';
export default function App(){
 const [data,setData]=useState<Data>(load); const [page,setPage]=useState<PageId>('home'); const [activeId,setActiveId]=useState<string>();
 useEffect(()=>save(data),[data]);
 if(!data.onboardingComplete)return <Onboarding data={data} finish={d=>{setData({...d,onboardingComplete:true});setPage('templates')}}/>;
 const active=data.projects.find(p=>p.id===activeId);
 const openTemplate=(template:TemplateId)=>{const p:Project={id:id('graphic'),name:TEMPLATE_CATALOGUE.find(t=>t.id===template)?.name||'Graphic',template,format:'feed',sponsorIds:data.sponsors.slice(0,10).map(s=>s.id),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),heroImage:'',heroImageWidth:0,heroImageHeight:0,heroX:0,heroY:0,heroScale:1,heroFlip:false,driverX:0,driverY:0,driverScale:1,driverVisible:true,details:{...emptyDetails}};setData(d=>({...d,projects:[p,...d.projects]}));setActiveId(p.id);setPage('builder')};
 const patchProject=(patch:Partial<Project>)=>setData(d=>({...d,projects:d.projects.map(p=>p.id===activeId?{...p,...patch,updatedAt:new Date().toISOString()}:p)}));
 const appStyle:any={'--brand-primary':data.branding.primary,'--brand-secondary':data.branding.secondary,'--brand-accent':data.branding.accent,'--brand-heading':data.branding.headingFont,'--brand-body':data.branding.bodyFont};
 return <div className="app" style={appStyle}><Sidebar activePage={page} onNavigate={setPage}/><main>
  {page==='home'&&<HomePage data={data} openTemplate={openTemplate} openTemplates={()=>setPage('templates')}/>} 
  {page==='templates'&&<TemplateLibraryPage openTemplate={openTemplate}/>} 
  {page==='profile'&&<ProfilePage data={data} setData={setData}/>} 
  {page==='branding'&&<BrandingPage data={data} setData={setData}/>} 
  {page==='sponsors'&&<SponsorsPage data={data} setData={setData}/>} 
  {page==='saved'&&<SavedGraphicsPage data={data} setData={setData} open={p=>{setActiveId(p.id);setPage('builder')}}/>}
  {page==='builder'&&active&&<Builder data={data} project={active} patch={patchProject} back={()=>setPage('templates')}/>} 
 </main></div>
}

function Onboarding({data,finish}:{data:Data;finish:(d:Data)=>void}){const [draft,setDraft]=useState(data);const p=draft.profile;const valid=p.name.trim()&&p.number.trim();return <div className="onboarding"><div className="onboarding-card"><div className="logo large"><span>MF</span><div><b>MEDIA FACTORY</b><small>DRIVER GRAPHICS</small></div></div><span className="eyebrow">WELCOME</span><h1>Create your driver profile</h1><p>Your profile supplies the permanent details and assets used across your templates. Hero images are selected separately for each graphic.</p><div className="onboarding-grid"><div className="portrait-upload">{p.driverImage?<img src={p.driverImage}/>:<UserRound size={54}/>}<Upload label="Driver image" purpose="portrait" on={v=>setDraft({...draft,profile:{...p,driverImage:v}})}/></div><div className="form-grid single">{DRIVER_FIELDS.map(k=><label key={k}>{labelForDriverField(k)}<input value={p[k]} onChange={e=>setDraft({...draft,profile:{...p,[k]:e.target.value}})}/></label>)}<Upload label="Team logo" purpose="logo" on={v=>setDraft({...draft,profile:{...p,teamLogo:v}})}/><Upload label="Competition logo" purpose="logo" on={v=>setDraft({...draft,profile:{...p,competitionLogo:v}})}/></div></div><button className="primary wide" disabled={!valid} onClick={()=>finish(draft)}>Create profile</button></div></div>}
