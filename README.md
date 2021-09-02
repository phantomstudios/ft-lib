# ft-lib

[![NPM version][npm-image]][npm-url]
[![Actions Status][ci-image]][ci-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]

A collection of Javascript utils for shareable UI and tracking functionality across Phantom FT sites 

## Introduction

currently implemented:
consentMonitor - polls the FT consent cookies to enable/disable the FT Permutive ad tracking
permutiveVideoUtils - formatted permutive video progress event

```javascript
import useLibrary from "@phntms/ft-lib";

const { something } = useLibrary({
  argument1: "something",
  argument2: "something else",
});
```

## Installation

Install this package with `npm`.

```bash
npm i @phntms/ft-lib
```

## Usage

Example 1 description.

```JSX
import React from 'react';
import useLibrary from '@phntms/PACKAGE-NAME';

const SomeExample = () = {
  const { something } = useApi({
    argument1: "something",
    argument2: "something else",
  });

  return (
    <>
      <h1>Result</h2>
      <p>{something}</p>
    </>
  );
}
```

Example 2 description.

```JSX
import React from 'react';
import useLibrary from '@phntms/PACKAGE-NAME';

const SomeExample2 = () = {
  const { something } = useApi({
    argument1: "something",
    argument2: "something else",
  });

  return (
    <>
      <h1>Result</h2>
      <p>{something}</p>
    </>
  );
}
```

## API

### Input

- `argument1` : Required - Description of argument.
- `argument2` : Optional - Description of argument.

### Output

- `something`: Description of output.

[npm-image]: https://img.shields.io/npm/v/@phntms/PACKAGE-NAME.svg?style=flat-square&logo=react
[npm-url]: https://npmjs.org/package/@phntms/PACKAGE-NAME
[npm-downloads-image]: https://img.shields.io/npm/dm/@phntms/PACKAGE-NAME.svg
[npm-downloads-url]: https://npmcharts.com/compare/@phntms/PACKAGE-NAME?minimal=true
[ci-image]: https://github.com/phantomstudios/PACKAGE-NAME/workflows/test/badge.svg
[ci-url]: https://github.com/phantomstudios/PACKAGE-NAME/actions
