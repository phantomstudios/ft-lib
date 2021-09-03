# ft-lib

[![NPM version][npm-image]][npm-url]
[![Actions Status][ci-image]][ci-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]

A collection of Javascript utils for shareable UI and tracking functionality across Phantom FT sites 

## Introduction

currently implemented:
- consentMonitor - polls the FT consent cookies set by the approved FT Origami cookie banner to enable/disable the FT Permutive ad tracking
- permutiveVideoUtils - formatted permutive video progress events

## Installation

Install this package with `npm`.

```bash
npm i @phntms/ft-lib
```

## Usage

consentMonitor - Adds an FT consent cookie poller to enable/disable Permutive consent (only useful if 'consentRequired' is set as an option in the site's Permutive script - see here[https://support.permutive.com/hc/en-us/articles/360010845519-Seeking-User-Consent#h_00327830-509b-422a-952b-1906264031f1])
The optional constructor arg (default ["localhost", "phq"]) accepts a string or array of strings to includes match 
The utility also includes an FT banner event listener ((see here[https://registry.origami.ft.com/components/o-cookie-message@6.0.1/readme?brand=master] for a list of banner DOM events) to set session-level cookies for development environments

```Javascript
import { consentMonitor } from "@phntms/ft-lib";

new consentMonitor(["localhost", "phq", "staging"]);
```

permutiveVideoUtils - emitPermutiveProgressEvents - used within a video player's progress event handler to fire Permutive video progress events at [0, 25, 50, 75, 100] percent progress.
Optional 3rd arg to pass a window.interval instance to be cleared once progress is complete.

```Javascript
import { permutiveVideoUtils } from "@phntms/ft-lib";

const permutivevideoTracker = new permutiveVideoUtils("<FT CAMPAIGN>","<VIDEO-TITLE>","<VIDEO-ID/URL>")  //Data will be site implementation specific

player.on("progress", () => {   //event will be video player site implementation specific
   permutivevideoTracker.emitPermutiveProgressEvent(<DURATION>, <CURRENTTIME>, <OPTIONAL-WINDOW-INTERVAL>)
});
```

[npm-image]: https://img.shields.io/npm/v/@phntms/ft-lib.svg?style=flat-square&logo=react
[npm-url]: https://npmjs.org/package/@phntms/ft-lib
[npm-downloads-image]: https://img.shields.io/npm/dm/@phntms/ft-lib.svg
[npm-downloads-url]: https://npmcharts.com/compare/@phntms/ft-lib?minimal=true
[ci-image]: https://github.com/phantomstudios/ft-lib/workflows/test/badge.svg
[ci-url]: https://github.com/phantomstudios/ft-lib/actions
