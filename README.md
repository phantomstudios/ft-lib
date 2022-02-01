# ft-lib

[![NPM version][npm-image]][npm-url]
[![Actions Status][ci-image]][ci-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]

A collection of Javascript utils for shareable UI and tracking functionality across Phantom FT sites

## Introduction

currently implemented:

- FTTracking - Consolidated Origami and GA/GTM event tracking for page and interaction events.
- consentMonitor - polls the FT consent cookies set by the approved FT Origami cookie banner to enable/disable the FT Permutive ad tracking
- permutiveVideoUtils - formatted permutive video progress events
- reactPlayerTracking - Video tracking for FT sites implementing videos with [react-player](https://github.com/cookpete/react-player)
- ytIframeEventHandler - Video tracking handler for FT sites with embedded Youtube Iframe API videos.

## Installation

Install this package with `npm`.

```bash
npm i @phntms/ft-lib
```

## Usage

### FTTracking

Shared Origami and GA/GTM tracking implementation that can be used across all Phantom FT sites. Tracking meta data is provided by a config object when first initiated and on subsequent route changes (only required for SPA/NextJS sites).
By default, the implementation will automatically handle FT tracking via `data-gadl` and `data-o-event` HTML attributes. The tracker instance can be added to the global window namespace if custom events are required.
Note: By default the FTTracker instance will load the `consentMonitor` poller, do site's do not need to include this separately.

The FTTracking constructor requires the config JSON object (TODO - schema) and optionally accepts an options object:

#### Default options

```
  scrollTrackerSelector: "#o_tracker_scroll",
  isCustomGTMEvent: true,

```

Typical usage:

```Javascript
import { FTTracking } from '@phntms/ft-lib'

//For Wagtail sites, get server-rendered o-tracking-data
const config = JSON.parse(document.getElementById('o-tracking-data').textContent)
window.FTTracker = new FTTracking(config, { scrollTrackerSelector: '#content' })
.
.
window.FTTracker.gtmEvent(`audio player`, '100% progress', window.gtmCategory)
```

### consentMonitor

Adds an FT consent cookie poller to enable/disable Permutive consent (only useful if 'consentRequired' is set as an option in the site's Permutive script - see [here](https://support.permutive.com/hc/en-us/articles/360010845519-Seeking-User-Consent#h_00327830-509b-422a-952b-1906264031f1)
There are optional constructor args for the hostname (defaults to window.location.hostname) and the dev environment host matches (defaults to ["localhost", "phq", "vercel.app"]) which are used to determine development environments in order to generate an FT banner event listener ((see [here](https://registry.origami.ft.com/components/o-cookie-message@6.0.1/readme?brand=master) for a list of banner DOM events) to set session-level cookies for development environments

```Javascript
import { consentMonitor } from "@phntms/ft-lib";

new consentMonitor("FT.staging.testsite.com". ["localhost", "phq", "staging"]);
```

### permutiveVideoUtils

emitPermutiveProgressEvents - used within a video player's progress event handler to fire Permutive video progress events at [0, 25, 50, 75, 100] percent progress.
Optional 3rd arg to pass a window.interval instance to be cleared once progress is complete.

```Javascript
import { permutiveVideoUtils } from "@phntms/ft-lib";

const permutivevideoTracker = new permutiveVideoUtils("<FT-CAMPAIGN>","<VIDEO-TITLE>","<VIDEO-ID/URL>")  //Data will be site implementation specific

player.on("progress", () => {   //event will be video player site implementation specific
   permutivevideoTracker.emitPermutiveProgressEvent(<DURATION>, <CURRENTTIME>, <OPTIONAL-WINDOW-INTERVAL>)
});
```

### reactPlayerTracking

Exports video event handlers that broadcast the required GA, oTracking and Permutive events.
NOTE: Currently implemented for react-player implementations only but will be expanded to handle other video player implementations (Youtube Iframe API players specifically) which require slightly different 'progress' monitoring.

The constructor takes the parent site's oTracking/Origami eventDispatcher function and video and site meta data (as required for the tracking data), along with an optional `options` object (see below)

Typical implementation:

```Javascript
import { reactPlayerTracking } from "@phntms/ft-lib";

const [videoTracker] = useState(
   new reactPlayerTracking(eventDispatcher, <VIDEO-TITLE>, <VIDEO-URL>,<FT-CAMPAIGN>,
    { isPermutiveTracking: true },
   ),
)

<ReactPlayer
   onDuration={videoTracker.setDuration}
   onEnded={videoTracker.trackEnded}
   onPause={videoTracker.trackPause}
   onPlay={videoTracker.trackPlay}
   onProgress={videoTracker.trackProgress}
>
```

#### Default Options:

```
  isPermutiveTracking: false,
  routeUrl: window.location.href,
  category: "video",
  product: "paid-post",
```

[npm-image]: https://img.shields.io/npm/v/@phntms/ft-lib.svg?style=flat-square&logo=react
[npm-url]: https://npmjs.org/package/@phntms/ft-lib
[npm-downloads-image]: https://img.shields.io/npm/dm/@phntms/ft-lib.svg
[npm-downloads-url]: https://npmcharts.com/compare/@phntms/ft-lib?minimal=true
[ci-image]: https://github.com/phantomstudios/ft-lib/workflows/test/badge.svg
[ci-url]: https://github.com/phantomstudios/ft-lib/actions
