import { consentMonitor } from "../src/consentMonitor";
import { permutiveVideoUtils } from "../src/permutiveVideoUtils";

describe("consentMonitor", () => {
  it("can be initiated", () => {
    const obj = new consentMonitor();
    expect(obj.consent).toBe(false);
  });
  it("sets default dev hosts property", async () => {
    const obj = new consentMonitor("https://FT-staging.com");
    expect(obj.devHosts).toEqual(["localhost", "phq", "vercel.app"]);
  });
  it("matches hostname to devHosts", async () => {
    const obj = new consentMonitor("https://FT-staging.devhost.com", [
      "localhost",
      "vercel.app",
      "phq",
      "devhost",
    ]);
    expect(obj.isDevEnvironment).toBe(true);
  });
  //TODO - mock document.cookie get/set and test consent value
});

describe("Permutive video progress utils", () => {
  it("can be initiated", () => {
    const permutiveVideoTracker = new permutiveVideoUtils(
      "FT-Campaign",
      "video title",
      "videoID"
    );
    expect(permutiveVideoTracker.remainingProgress).toEqual([
      0, 0.25, 0.5, 0.75, 1,
    ]);
  });
});
