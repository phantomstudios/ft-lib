declare module "@financial-times/o-tracking";
declare module "@financial-times/o-viewport";

interface ConsentOptions {
  opt_in?: boolean;
  token?: string;
}

declare module "@financial-times/cmp-client" {
  export function interceptManageCookiesLinks(): void;
}
interface SourcepointCmpAPI {
  queue?: Array<() => void>;
  addEventListener?: (
    eventName: string,

    callback: (...args: any[]) => void,
  ) => void;
}
interface Window {
  _sp_: SourcepointCmpAPI;
  _sp_queue?: Array<() => void>;
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
