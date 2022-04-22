declare module "@financial-times/o-tracking";
declare module "@financial-times/o-viewport";

interface Window {
  dataLayer: any;
  gtag: any;
  permutive: {
    addon: any;
    consent: CallableConsent;
    track: any;
  };
  gtmCategory?: string; //channels only
  isOvideoPlayer?: boolean; //channels only
}

interface ConsentOptions {
  opt_in?: boolean;
  token?: string;
}

interface CallableConsent {
  ({}: ConsentOptions): void;
}

interface VideoTrackingOptions {
  isOTracking?: boolean;
  isGATracking?: boolean;
  isPermutiveTracking?: boolean;
  GA_datalayer?: any;
  GA_milestones?: number[];
  oTracking_milestones?: number[];
  route_url?: string;
}
