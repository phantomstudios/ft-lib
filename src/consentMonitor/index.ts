/*  Utility class for FT cookie consent Permutive tracking behaviour */
/*  Currently this implements:
    1) FT Consent cookies monitoring to enable/disable permutive tracking (with configurable dev/staging hosts (i.e. localhost/phq) to simulate production FT cookies to help testing)
*/
import Debug from "debug";
const debug = Debug("@phntms/ft-lib");

export class consentMonitor {
  protected _consent = false;
  protected _devHosts: string[] | string;
  protected _isDevEnvironment = false;
  protected _hostname: string;

  constructor(
    hostname: string = window.location.hostname,
    devHosts: string[] | string = ["localhost", "phq", "vercel.app"]
  ) {
    this._devHosts = devHosts;
    this._hostname = hostname;
    this.init();
  }

  get consent(): boolean {
    return this._consent;
  }

  get devHosts(): string[] | string {
    return this._devHosts;
  }

  get isDevEnvironment(): boolean {
    return this._isDevEnvironment;
  }

  getCookieValue = (name: string) =>
    document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "";

  init = () => {
    /* polling loop not ideal, but there does'nt seem to be a reliable route from the cookie preferences site back to calling site 
    so we need to actively monitor consent cookie changes */
    window.setInterval(() => {
      if (window.permutive) {
        if (
          this.getCookieValue("FTConsent").includes(
            "behaviouraladsOnsite%3Aon"
          ) &&
          !this.consent
        ) {
          debug("setting permutive tracking consent: on");
          window.permutive.consent({
            opt_in: true,
            token: "behaviouraladsOnsite:on",
          });
          this._consent = true;
        } else if (
          !this.getCookieValue("FTConsent").includes(
            "behaviouraladsOnsite%3Aon"
          ) &&
          this.consent
        ) {
          debug("setting permutive tracking consent: off");
          window.permutive.consent({ opt_in: false });
          this._consent = false;
        }
      }
    }, 3000);

    //Simulate cookie consent behaviour in non-prod environments - TODO confirm best non production conditional..
    if (Array.isArray(this._devHosts)) {
      this._devHosts.map(
        (devHost) =>
          this._hostname.includes(devHost) && this.setDevCookieHandler()
      );
    } else {
      if (this._hostname.includes(this._devHosts)) this.setDevCookieHandler();
    }
  };

  setDevCookieHandler = () => {
    this._isDevEnvironment = true;
    debug("setting development environment from host match");
    const oCookieMessage =
      document.getElementsByClassName("o-cookie-message")[0];
    if (oCookieMessage) {
      const onCookieMessageAct = () => {
        debug("setting development FT consent cookies");
        document.cookie = "FTConsent=behaviouraladsOnsite%3Aon";
        document.cookie = "FTCookieConsentGDPR=true";
        oCookieMessage.removeEventListener(
          "oCookieMessage.act",
          onCookieMessageAct,
          false
        );
      };
      oCookieMessage.addEventListener("oCookieMessage.act", onCookieMessageAct);
    }
  };
}
