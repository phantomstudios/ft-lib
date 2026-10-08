declare module "@financial-times/o-tracking";
declare module "@financial-times/o-viewport";

interface ConsentOptions {
  opt_in?: boolean;
  token?: string;
}

declare module "@financial-times/cmp-client" {
  export function interceptManageCookiesLinks(): void;
  export const properties: {
    [key: string]: any;
  };
  export function initSourcepointCmp(options?: {
    propertyConfig?: any;
  }): Promise<void>;
}

interface TCFData {
  eventStatus: "tcloaded" | "useractioncomplete" | "cmpuishown";
  listenerId: number;
  purpose?: {
    consents?: Record<number, boolean>;
  };
  vendor?: {
    consents?: Record<number, boolean>;
  };
  gdprApplies?: boolean | undefined;
}
interface SourcepointCmpAPI {
  queue?: Array<() => void>;
  addEventListener?: (
    eventName: string,
    callback: (...args: any[]) => void,
  ) => void;
  usnat?: {
    getUserConsents: (callback: (consents: any) => void) => void;
  };
}

interface Window {
  _sp_: SourcepointCmpAPI;
  _sp_queue?: Array<() => void>;
  __tcfapi?: (
    command: string,
    version: number,
    callback: (tcData: TCFData | null, success: boolean) => void,
    parameter?: any,
  ) => void;
  __gpp?: (
    command: string,
    callback?: (data: any, success: boolean) => void,
    parameter?: any,
  ) => void;

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
