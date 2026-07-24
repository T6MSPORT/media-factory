import { ImagePlus } from 'lucide-react';
import { processImageFile, type ImagePurpose } from '../../utils/images';

export function BackgroundUpload({on}:{on:(v:string)=>void|Promise<void>}){return <label className="upload">Upload background image<span><ImagePlus size={16}/>Upload</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{const image=await processImageFile(f,'background');await on(image)}catch(err){alert(err instanceof Error?err.message:'The image could not be uploaded.')}finally{e.currentTarget.value=''}}}/></label>}

export function Upload({label,on,purpose='portrait'}:{label:string;on:(v:string)=>void;purpose?:ImagePurpose}){return <label className="upload">{label}<span><ImagePlus size={16}/>Upload</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{on(await processImageFile(f,purpose))}catch(err){alert(err instanceof Error?err.message:'The image could not be uploaded.')}finally{e.currentTarget.value=''}}}/></label>}

