interface Window {
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
