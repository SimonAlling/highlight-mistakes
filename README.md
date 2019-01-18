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

`highlight-mistakes` exports two functions: `proofreadWith` and `highlightWith`.
To use `proofreadWith`, you have to define these things:

  * A list of rules describing what should be marked as a mistake and what should be verified as correct.
  * A function that highlights a single mistake and one for non-mistakes.

`highlightWith` can be used to further process the output of `proofreadWith`, e.g. to make non-breaking spaces neither marked as correct nor incorrect visible to a human editor.


### Basic Example

The canonical example is trying to enforce correct usage of non-breaking spaces and/or non-breaking hyphens, since those are difficult or impossible to tell from their breaking counterparts by visual inspection.

Here, we want non-breaking spaces between numbers and units (just a handful for illustration purposes) – e.g. "144 Hz" or "1 TB" – as well as in phrases like "Core i7".
We also want non-breaking hyphens in "G‑Sync" and phrases like "i7‑8700K".
(The text in question is assumed to be in HTML, hence `&nbsp;`.
That's also why we use `<pre>`; otherwise a highlighted space might not be visible at all.)

```typescript
import { proofreadWith, simpleRule } from "highlight-mistakes";

const DESC_NBSP = {
    bad: " ",
    good: "&nbsp;",
    info: "NBSP",
};

const DESC_NBH = {
    bad: "-",
    good: "‑",
    info: "NBH",
};

const RULES_NB_SPACE = [
    simpleRule(DESC_NBSP)(/\d+/, /[nµmcdkMGTP]?(?:Hz|b|bit|B|byte)\b/),
    simpleRule(DESC_NBSP)(/Core/, /i\d/),
];

const RULES_NB_HYPHEN = [
    simpleRule(DESC_NBH)(/G/, /Sync/),
    simpleRule(DESC_NBH)(/i\d/, /\d{4}/),
];

function markAs(className: string): (info: string | null) => (s: string) => string {
    return _ => s => `<pre class="${className}">${s}</pre>`;
}

const proofread = proofreadWith({
    rules: RULES_NB_SPACE.concat(RULES_NB_HYPHEN),
    markMistake: markAs("mistake"),
    markVerified: markAs("verified"),
});

console.log(proofread("G-Sync is from Nvidia, the up to 4.7&nbsp;GHz Core i7-8700K is from Intel, and 240 Hz monitors are great for gaming."));
```

In this example, the hyphens in `G-Sync` and `i7-8700K` and the spaces in `Core i7` and `240 Hz` are highlighted as mistakes, whereas the non-breaking space in `4.7&nbsp;GHz` is highlighted as verified.


## Correctness

`highlight-mistakes` is no better than the patterns fed into it.
It's up to the user of this library to define what is correct and incorrect as precisely as possible.
The intention is to aid a human in detecting mistakes; neither soundness nor completeness is probably feasible in most cases.


[npm-image]: https://img.shields.io/npm/v/highlight-mistakes.svg
[npm-url]: https://npmjs.org/package/highlight-mistakes
[npm-downloads]: https://img.shields.io/npm/dm/highlight-mistakes.svg
