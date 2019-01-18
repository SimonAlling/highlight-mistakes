import {
    literalRule,
    simpleRule,
    matchRule,
    regexRule,
    Rule,
    NO_INFO,
} from "../src/rules";

// Non-breaking space, non-breaking hyphen:
export const PATTERN_DOPPELGANGERS = /&nbsp;|‑/g;

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

const DESC_END = {
    bad: "-",
    good: "–",
    info: "END",
};

const literalNBSP = literalRule(DESC_NBSP);
const singleNBSP = simpleRule(DESC_NBSP);
const matchNBSP = matchRule(DESC_NBSP);
const regexNBSP = regexRule(DESC_NBSP);

const literalNBH = literalRule(DESC_NBH);
const singleNBH = simpleRule(DESC_NBH);
const matchNBH = matchRule(DESC_NBH);
const regexNBH = regexRule(DESC_NBH);

const literalEND = literalRule(DESC_END);
const singleEND = simpleRule(DESC_END);
const matchEND = matchRule(DESC_END);
const regexEND = regexRule(DESC_END);

export const RULE_NBSP_4K = literalNBSP("4K", "UHD");
export const RULE_NBSP_GTX = singleNBSP(/GTX/, /\d+/);
export const RULE_NBSP_GEFORCE_GTX = matchNBSP(/Geforce/, / GTX /, /\d+/);

export const RULE_NBH_GSYNC = literalNBH("G", "Sync");
export const RULE_NBH_DDR = singleNBH(/DDR\d/, /\d+/);
export const RULE_NBH_DATES = regexNBH(/\d+-\d+(?:-\d+)+/);

export const RULE_END_INTERVALS = regexEND(/(?:^|[^\d\u002D])\d{1,3}(?:,\d+)?-\d+(?:,\d+)?\b/);

export const RULE_SUP2 = literalRule({ good: "²", bad: "<sup>2</sup>", info: NO_INFO })(null, null);

export const RULES_NBSP = [
    RULE_NBSP_4K,
    RULE_NBSP_GEFORCE_GTX,
    RULE_NBSP_GTX,
    singleNBSP(/\d+/, /(?=[nµmcdkMGTP]?(?:g|m|Hz|b|bit|B|byte|V|W|Wh|%)(?=$|[^\wåäöé]))/),
    singleNBSP(/Core/, /i\d/),
    singleNBSP(/A/, /B(?= C)/), // only require NBSP between A and B
    singleNBSP(/(?<=X )Y/, /Z/), // only require NBSP between Y and Z
];

export const RULES_NBH = [
    RULE_NBH_GSYNC,
    RULE_NBH_DDR,
    RULE_NBH_DATES, // dates, RAM latencies etc
    singleNBH(/i\d/, /\d{4}/),
];

export const RULES_END = [
    RULE_END_INTERVALS,
    literalEND(" ", " "),
];

export const RULES = (([] as Rule[])
    .concat(RULES_NBSP)
    .concat(RULES_NBH)
    .concat(RULES_END)
    .concat(RULE_SUP2)
);
