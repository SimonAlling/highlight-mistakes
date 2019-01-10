# highlight-mistakes
> Highlight mistakes and their absence in a piece of text.

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]


## Table of Contents

1. [Installation](#installation)
1. [Why?](#why)
1. [Usage](#usage)
    1. [Basic Example](#basic-example)
1. [Correctness](#correctness)

## Installation

```sh
npm install --save highlight-mistakes
```

I would recommend TypeScript or some other setup that provides auto-completion and type checking.


## Why?

`highlight-mistakes` highlights mistakes and their absence in a piece of text based on a given specification.
It is intended as a complementary tool for authoring and proof-reading written text.


## Usage

`highlight-mistakes` can highlight mistakes, their absence or both.
If you only want to highlight mistakes, you have to define two things:

  * A list of mistakes that should be highlighted.
  * A function that highlights a single mistake.

If you only want to highlight the probable absence (see [_Correctness_](#correctness)) of mistakes:

  * A pattern that describes what should be highlighted.
  * A function that highlights a single match.

If you want to highlight both mistakes and their absence, you need all those things.


### Basic Example

The canonical example is trying to enforce correct usage of non-breaking spaces and/or non-breaking hyphens, since those are difficult or impossible to tell from their breaking counterparts by visual inspection.

Here, we want non-breaking spaces between numbers and units (just a handful for illustration purposes) – e.g. "144 Hz" or "1 TB" – as well as in phrases like "Core i7".
We also want non-breaking hyphens in "G‑Sync" and phrases like "i7‑8700K".
(The text in question is assumed to be in HTML, hence `&nbsp;`.
That's also why we use `<pre>`; otherwise a highlighted space might not be visible at all.)

```typescript
import { highlightWith } from "highlight-mistakes";

const PATTERN_VERIFY = /&nbsp;|‑/g;

const PATTERNS_MISTAKE_NB_SPACE = [
    /(\d+ [nµmcdkMGTP]?(?:Hz|b|bit|B|byte))\b/,
    /Core i\d/,
];

const PATTERNS_MISTAKE_NB_HYPHEN = [
    /G-Sync/,
    /i\d-\d{4}/,
];

const MISTAKES = [
    { substring: " ", contexts: PATTERNS_MISTAKE_NB_SPACE },
    { substring: "-", contexts: PATTERNS_MISTAKE_NB_HYPHEN },
];

function markWith(className: string): (info: string | null) => (s: string) => string {
    return _ => s => `<pre class="${className}">${s}</pre>`;
}

const highlight = highlightWith({
    mistakes: MISTAKES,
    verify: PATTERN_VERIFY,
    identifiers: { mistake: "mistake", verified: "verified" },
    markWith,
});

console.log(highlight("G-Sync is from Nvidia, the up to 4.7&nbsp;GHz Core i7-8700K is from Intel, and 240 Hz monitors are great for gaming."));
```

In this example, the hyphens in `G-Sync` and `i7-8700K` and the spaces in `Core i7` and `240 Hz` are highlighted as mistakes, whereas the non-breaking space in `4.7&nbsp;GHz` is highlighted as verified.


## Correctness

`highlight-mistakes` is no better than the patterns fed into it.
It's up to the user of this library to define what should be highlighted as precisely as possible.
The intention is to aid a human in detecting mistakes; neither soundness nor completeness is probably feasible in most cases.

However, one thing that should be noted is that "verified" does not really mean verified as in correct.
Marking some patterns as "verified" is primarily intended as a way of making characters like non-breaking spaces and non-breaking hyphens visible, so that a human can tell the difference between them and their regular counterparts.
Ergo, a "verified" non-breaking space, for example, might very well be incorrect.


[npm-image]: https://img.shields.io/npm/v/highlight-mistakes.svg
[npm-url]: https://npmjs.org/package/highlight-mistakes
[npm-downloads]: https://img.shields.io/npm/dm/highlight-mistakes.svg
