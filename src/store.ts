import type { Data, GraphicDetails } from './types';
const KEY='media-factory-individual-v1';
export const emptyDetails:GraphicDetails={eventName:'',round:'',circuit:'',date:'',time:'',headline:'',subheadline:'',result:'',position:'',scheduleLines:'',sponsorName:''};
export const starter:Data={
 onboardingComplete:false,
 profile:{name:'',number:'',team:'',car:'',location:'',age:''},
 branding:{primary:'#ef3b3b',secondary:'#111317',accent:'#ffffff',headingFont:'Orbitron',bodyFont:'Rajdhani',sponsorLogoScale:1},
 sponsors:[],projects:[]
};
export function load():Data{try{const raw=localStorage.getItem(KEY);if(!raw)return starter;const parsed=JSON.parse(raw);const profile={...starter.profile,...parsed.profile};delete profile.heroImage;delete profile.carImage;const motorsportFonts=['Orbitron','Rajdhani','Teko','Oxanium','Russo One'];const branding={...starter.branding,...parsed.branding,sponsorLogoScale:Number.isFinite(parsed.branding?.sponsorLogoScale)?Math.min(1.4,Math.max(.65,parsed.branding.sponsorLogoScale)):1,headingFont:motorsportFonts.includes(parsed.branding?.headingFont)?parsed.branding.headingFont:starter.branding.headingFont,bodyFont:motorsportFonts.includes(parsed.branding?.bodyFont)?parsed.branding.bodyFont:starter.branding.bodyFont};return {...starter,...parsed,profile,branding,projects:(parsed.projects||[]).map((p:any)=>({...p,driverX:Number.isFinite(p.driverX)?p.driverX:0,driverY:Number.isFinite(p.driverY)?p.driverY:0,driverScale:Number.isFinite(p.driverScale)?p.driverScale:1,driverVisible:p.driverVisible!==false,exportedAt:typeof p.exportedAt==='string'?p.exportedAt:undefined,heroScale:Number.isFinite(p.heroScale)&&p.heroScale>=1?p.heroScale:1,heroImageWidth:Number.isFinite(p.heroImageWidth)?p.heroImageWidth:0,heroImageHeight:Number.isFinite(p.heroImageHeight)?p.heroImageHeight:0,heroImage:typeof p.heroImage==='string'&&p.heroImage.length<3000000?p.heroImage:''}))}}catch{return starter}}
export function save(data:Data){
 try{localStorage.setItem(KEY,JSON.stringify(data))}
 catch(error){
  console.error('Media Factory could not save the latest change.',error);
  window.dispatchEvent(new CustomEvent('media-factory-storage-error'));
 }
}
export function id(prefix:string){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
