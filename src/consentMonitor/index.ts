/*  Utility class for FT cookie consent Permutive tracking behaviour */
/*  Currently this implements:
    1) FT Consent cookies monitoring to enable/disable permutive tracking (with configurable dev/staging hosts (i.e. localhost/phq) to simulate production FT cookies to help testing)
*/
import Debug from "debug";
const debug = Debug("@phntms/ft-lib");

export class consentMonitor {
  protected _consent = false;
  protected _devHosts: string[] | string;

  constructor(devHosts: string[] | string = ["localhost", "phq"]) {
    this._devHosts = devHosts;
    this.init();
  }

  get consent(): boolean {
    return this._consent;
  }

  get devHosts(): string[] | string {
    return this._devHosts;
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
    if (this._devHosts.includes(window.location.hostname)) {
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
        oCookieMessage.addEventListener(
          "oCookieMessage.act",
          onCookieMessageAct
        );
      }
    }
  };
}
