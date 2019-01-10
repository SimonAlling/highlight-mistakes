import {
    highlightWith,
    highlightMistakesWith,
    highlightVerifiedWith,
} from "../src/index";

import {
    PATTERN_VERIFY,
    MISTAKES,
} from "./patterns";

const CLASS_MIS = "mis";
const CLASS_VER = "ver";

function markWith(className: string): (info: string | null) => (s: string) => string {
    return info => s => [ `<pre class="`, className, `"`, (info ? ` title="${info}"` : ""), `>`, s, `</pre>` ].join("");
}

const NO_INFO = null;
const markM = markWith(CLASS_MIS);
const markV = markWith(CLASS_VER)(NO_INFO);

const missingNBSP = markM(NO_INFO)(" ");
const missingNBH = markM("non-breaking hyphen")("-");

type Expectation = Readonly<{ in: string, out: string }>;

const highlightMistakes = highlightMistakesWith(MISTAKES, markM);
const highlightVerified = highlightVerifiedWith(PATTERN_VERIFY, markV);

const highlight = highlightWith({
    mistakes: MISTAKES,
    verify: PATTERN_VERIFY,
    identifiers: { mistake: CLASS_MIS, verified: CLASS_VER },
    markWith,
});

const EXPECTATIONS_MISTAKES_NB_SPACE = [
    { in: `5 GHz`, out: `5${missingNBSP}GHz` },
    { in: `at 5 GHz.`, out: `at 5${missingNBSP}GHz.` },
    { in: `a 5 GHz CPU`, out: `a 5${missingNBSP}GHz CPU` },
];

const EXPECTATIONS_VERIFIED_NB_SPACE = [
    { in: `5&nbsp;GHz`, out: `5${markV("&nbsp;")}GHz` },
    { in: `at 5&nbsp;GHz.`, out: `at 5${markV("&nbsp;")}GHz.` },
    { in: `a 5&nbsp;GHz CPU`, out: `a 5${markV("&nbsp;")}GHz CPU` },
];

const EXPECTATIONS_BOTH = [
    { in: `5&nbsp;GHz eller 4 GHz`, out: `5${markV("&nbsp;")}GHz eller 4${missingNBSP}GHz` },
];

const EXPECTATIONS_MISTAKES_NB_HYPHEN = [
    { in: `G-Sync`, out: `G${missingNBH}Sync` },
    { in: `i7-8700K`, out: `i7${missingNBH}8700K` },
];

const EXPECTATIONS_VERIFIED_NB_HYPHEN = [
    { in: `G‑Sync`, out: `G${markV("‑")}Sync` },
    { in: `i7‑8700K`, out: `i7${markV("‑")}8700K` },
];

const EXPECTATIONS_DIFFERENT_MISTAKES = [
    { in: `Core i7-8700K`, out: `Core${missingNBSP}i7${missingNBH}8700K` },
    { in: `Core i7‑8700K`, out: `Core${missingNBSP}i7${markV("‑")}8700K` },
    { in: `Core&nbsp;i7-8700K`, out: `Core${markV("&nbsp;")}i7${missingNBH}8700K` },
    { in: `Core&nbsp;i7‑8700K`, out: `Core${markV("&nbsp;")}i7${markV("‑")}8700K` },
];

const EXPECTATIONS_WORD_BOUNDARIES = [
    { in: `144 Hz-skärm`, out: `144${missingNBSP}Hz-skärm` },
    { in: `144 Hza`, out: `144 Hza` },
    { in: `100 g kan`, out: `100${missingNBSP}g kan` },
    { in: `100 går`, out: `100 går` },
];

const EXPECTATIONS_CAPTURE_GROUPS = [
    { in: `A B C`, out: `A${missingNBSP}B C` },
    { in: `X Y Z`, out: `X Y${missingNBSP}Z` },
];

function test(expectations: ReadonlyArray<Expectation>): void {
    expectations.forEach(e => {
        expect(highlight(e.in)).toBe(e.out);
    });
}

it("provides the intended API", () => {
    expect(highlightMistakes("5 GHz")).toBe(`5${missingNBSP}GHz`);
    expect(highlightVerified("5&nbsp;GHz")).toBe(`5${markV("&nbsp;")}GHz`);
    expect(highlight("5&nbsp;GHz eller 4 GHz")).toBe(`5${markV("&nbsp;")}GHz eller 4${missingNBSP}GHz`);
});

it("can highlight missing NBSPs", () => {
    test(EXPECTATIONS_MISTAKES_NB_SPACE);
});

it("can highlight existing NBSPs", () => {
    test(EXPECTATIONS_VERIFIED_NB_SPACE);
});

it("can highlight both missing and existing NBSPs", () => {
    test(EXPECTATIONS_BOTH);
});

it("can highlight missing non-breaking hyphens", () => {
    test(EXPECTATIONS_MISTAKES_NB_HYPHEN);
});

it("can highlight existing non-breaking hyphens", () => {
    test(EXPECTATIONS_VERIFIED_NB_HYPHEN);
});

it("can handle different mistakes", () => {
    test(EXPECTATIONS_DIFFERENT_MISTAKES);
});

it("handles word boundaries correctly", () => {
    test(EXPECTATIONS_WORD_BOUNDARIES);
});

it("handles capture groups correctly", () => {
    test(EXPECTATIONS_CAPTURE_GROUPS);
});
