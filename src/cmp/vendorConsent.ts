export interface VendorConsentResults {
  brandmetrics: boolean;
  linkedIn: boolean;
  purpose1: boolean;
  gdprApplies: boolean;
  usnatApplies: boolean;
}

export function initVendorConsentListener(
  onConsentUpdate: (results: VendorConsentResults) => void,
): void {
  // --- Path 1: Check TCF API First ---
  if (typeof window.__tcfapi === "function") {
    window.__tcfapi("addEventListener", 2, (tcData, success) => {
      if (!success || !tcData) return;

      const isConsentReady =
        tcData.eventStatus === "tcloaded" ||
        tcData.eventStatus === "useractioncomplete";

      if (isConsentReady) {
        // If GDPR actually applies, process TCF consents (Opt-In model)
        if (tcData.gdprApplies !== false) {
          const results: VendorConsentResults = {
            brandmetrics: tcData.vendor?.consents?.[422] === true,
            linkedIn: tcData.vendor?.consents?.[804] === true,
            purpose1: tcData.purpose?.consents?.[1] === true,
            gdprApplies: true,
            usnatApplies: false,
          };

          onConsentUpdate(results);

          // Clean up TCF listener
          if (typeof tcData.listenerId === "number") {
            window.__tcfapi?.(
              "removeEventListener",
              2,
              () => {},
              tcData.listenerId,
            );
          }
          return;
        }

        // --- Path 2: TCF explicitly returned gdprApplies: false -> Fall back to USNat ---
        evaluateUSNatConsent(onConsentUpdate);

        // Clean up TCF listener since GDPR does not apply
        if (typeof tcData.listenerId === "number") {
          window.__tcfapi?.(
            "removeEventListener",
            2,
            () => {},
            tcData.listenerId,
          );
        }
      }
    });
  } else {
    // If __tcfapi doesn't exist at all, try evaluating USNat directly
    evaluateUSNatConsent(onConsentUpdate);
  }
}

/**
 * Helper to evaluate USNat / US Privacy consent (Opt-Out model)
 */
function evaluateUSNatConsent(
  onConsentUpdate: (results: VendorConsentResults) => void,
): void {
  // Option A: Preferred Sourcepoint SDK method
  if (typeof window._sp_?.usnat?.getUserConsents === "function") {
    window._sp_.usnat.getUserConsents((consents) => {
      // US Privacy is OPT-OUT by default, categories[1] = cookies
      const isConsented = consents?.categories[1].consented;

      onConsentUpdate({
        brandmetrics: isConsented,
        linkedIn: isConsented,
        purpose1: isConsented,
        gdprApplies: false,
        usnatApplies: true,
      });
    });
    return;
  }
}
