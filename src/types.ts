export type TemplateId = 'event'|'announcement'|'schedule'|'qualifying'|'results'|'sponsor';
export type FormatId = 'feed'|'story';
export type DriverProfile = {
  name:string; number:string; team:string;
  driverImage?:string; teamLogo?:string; competitionLogo?:string;
};
export type Branding = {
  primary:string; secondary:string; accent:string; headingFont:string; bodyFont:string; sponsorLogoScale:number;
};
export type Sponsor = {id:string; name:string; logo?:string; logoWidth?:number; logoHeight?:number};
export type GraphicDetails = {
  eventName:string; round:string; circuit:string; date:string; time:string;
  headline:string; subheadline:string; result:string; position:string;
  scheduleLines:string; sponsorName:string;
};
export type Project = {
  id:string; name:string; template:TemplateId; format:FormatId; sponsorIds:string[];
  createdAt:string; updatedAt:string; heroImage?:string; heroImageWidth?:number; heroImageHeight?:number; heroX:number; heroY:number; heroScale:number; heroFlip:boolean;
  driverX:number; driverY:number; driverScale:number; driverVisible:boolean; exportedAt?:string;
  details:GraphicDetails;
};
export type Data = {
  onboardingComplete:boolean; profile:DriverProfile; branding:Branding;
  sponsors:Sponsor[]; projects:Project[];
};
