interface Window {
  dataLayer: any;
  permutive: {
    addon: any;
    consent: CallableConsent;
    track: any;
  };
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
