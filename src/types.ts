export type TemplateId = 'event'|'announcement'|'schedule'|'results'|'sponsor';
export type FormatId = 'feed'|'story'|'square'|'custom';
export type ResultSessionType = 'qualifying'|'race';
export type GraphicElementId =
  | 'none'
  | 'chevrons'
  | 'speed-lines'
  | 'corner-frame'
  | 'grid'
  | 'dot-matrix'
  | 'crosshair'
  | 'racing-stripes'
  | 'apex-arc'
  | 'split-blocks'
  | 'slash-stack'
  | 'diamond'
  | 'hexagon'
  | 'circle-ring'
  | 'triangle'
  | 'checkered-panel'
  | 'tech-bracket'
  | 'wave'
  | 'starburst'
  | 'target'
  | 'wing';
export type BackgroundGraphicLayout = {
  graphicElement: GraphicElementId;
  graphicElementX: number;
  graphicElementY: number;
  graphicElementSize: number;
};
export type BackgroundGraphicSettings = {
  locked: boolean;
  feed: BackgroundGraphicLayout;
  story: BackgroundGraphicLayout;
};
export type DriverProfile = {
  name:string; number:string; team:string;
  nameLocked:boolean;
  driverImage?:string; teamLogo?:string; competitionLogo?:string;
};
export type Account = {
  id:string;
  email:string;
  driverName:string;
  createdAt:string;
};
export type Authentication = {
  account?:Account;
  signedIn:boolean;
  lastEmail?:string;
  pendingEmailConfirmation?:boolean;
};
export type Branding = {
  primary:string; secondary:string; accent:string; headingFont:string; bodyFont:string; sponsorLogoScale:number;
};
export type Sponsor = {id:string; name:string; logo?:string; logoWidth?:number; logoHeight?:number};
export type ScheduleDayName = ''|'Friday'|'Saturday'|'Sunday';
export type ScheduleSessionType = ''|'Practice'|'Qualifying'|'Race';
export type ScheduleSession = { type:ScheduleSessionType; time:string };
export type ScheduleDay = { day:ScheduleDayName; sessions:ScheduleSession[] };
export type GraphicDetails = {
  eventName:string; round:string; circuit:string; date:string; dateEnd?:string; time:string;
  headline:string; subheadline:string; result:string; position:string;
  scheduleLines:string; sponsorName:string;
  sponsorId?:string;
  announcementBackgroundOpacity?:number;
  sponsorLogoScale?:number; sponsorLogoY?:number;
  productImages?:string[];
  scheduleDayCount?:number; scheduleDays?:ScheduleDay[];
  resultSession?:ResultSessionType; raceNumber?:string;
};
export type Project = {
  id:string; name:string; template:TemplateId; format:FormatId; sponsorIds:string[];
  customWidth?:number; customHeight?:number;
  createdAt:string; updatedAt:string; heroImage?:string; heroImageWidth?:number; heroImageHeight?:number; heroX:number; heroY:number; heroScale:number; heroFlip:boolean; heroOverlayOpacity?:number;
  driverX:number; driverY:number; driverScale:number; driverVisible:boolean; exportedAt?:string;
  graphicElement?:GraphicElementId; graphicElementX?:number; graphicElementY?:number; graphicElementSize?:number;
  details:GraphicDetails;
};
export type Data = {
  onboardingComplete:boolean; profile:DriverProfile; branding:Branding;
  sponsors:Sponsor[]; projects:Project[];
  backgroundGraphic:BackgroundGraphicSettings;
  authentication:Authentication;
};
