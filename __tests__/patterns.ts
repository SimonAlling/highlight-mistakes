// Non-breaking space, non-breaking hyphen:
export const PATTERN_VERIFY = /&nbsp;|‑/g;

export const PATTERNS_MISTAKE_NB_SPACE = [
    // Swedish word boundary substitute at the end:
    /(\d+ [nµmcdkMGTP]?(?:g|m|Hz|b|bit|B|byte|V|W|Wh|%|))(?:$|[^\wåäöé])/,
    /Core i\d/, // Intel CPUs
    /(A B) C/, // only require NBSP between A and B
    /X (Y Z)/, // only require NBSP between Y and Z
];

export const PATTERNS_MISTAKE_NB_HYPHEN = [
    /G-Sync/,
    /i\d-\d{4}/, // Intel CPUs
    /Type-C\b/, // USB Type-C
];

export const PATTERNS_MISTAKE_ENDASH = [
    // *** BE CAREFUL! Read above. ***
    / - /,
    /\b\d+(?:,\d+)?-\d+(?:,\d+)?\b/, // intervals, e.g. 2-5; 1,5-2,0
    // *** BE CAREFUL! Read above. ***
];

export const MISTAKES = [
    { substring: " ", contexts: PATTERNS_MISTAKE_NB_SPACE },
    { substring: "-", contexts: PATTERNS_MISTAKE_NB_HYPHEN, info: "non-breaking hyphen" },
    { substring: "-", contexts: PATTERNS_MISTAKE_ENDASH, info: "en dash" },
];
