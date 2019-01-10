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

function markWith(className: string): (s: string) => string {
    return s => `<pre class="${className}">${s}</pre>`;
}

const markM = markWith(CLASS_MIS);
const markV = markWith(CLASS_VER);

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
    { in: `5 GHz`, out: `5${markM(" ")}GHz` },
    { in: `at 5 GHz.`, out: `at 5${markM(" ")}GHz.` },
    { in: `a 5 GHz CPU`, out: `a 5${markM(" ")}GHz CPU` },
];

const EXPECTATIONS_VERIFIED_NB_SPACE = [
    { in: `5&nbsp;GHz`, out: `5${markV("&nbsp;")}GHz` },
    { in: `at 5&nbsp;GHz.`, out: `at 5${markV("&nbsp;")}GHz.` },
    { in: `a 5&nbsp;GHz CPU`, out: `a 5${markV("&nbsp;")}GHz CPU` },
];

const EXPECTATIONS_BOTH = [
    { in: `5&nbsp;GHz eller 4 GHz`, out: `5${markV("&nbsp;")}GHz eller 4${markM(" ")}GHz` },
];

const EXPECTATIONS_MISTAKES_NB_HYPHEN = [
    { in: `G-Sync`, out: `G${markM("-")}Sync` },
    { in: `i7-8700K`, out: `i7${markM("-")}8700K` },
];

const EXPECTATIONS_VERIFIED_NB_HYPHEN = [
    { in: `G‑Sync`, out: `G${markV("‑")}Sync` },
    { in: `i7‑8700K`, out: `i7${markV("‑")}8700K` },
];

const EXPECTATIONS_DIFFERENT_MISTAKES = [
    { in: `Core i7-8700K`, out: `Core${markM(" ")}i7${markM("-")}8700K` },
    { in: `Core i7‑8700K`, out: `Core${markM(" ")}i7${markV("‑")}8700K` },
    { in: `Core&nbsp;i7-8700K`, out: `Core${markV("&nbsp;")}i7${markM("-")}8700K` },
    { in: `Core&nbsp;i7‑8700K`, out: `Core${markV("&nbsp;")}i7${markV("‑")}8700K` },
];

const EXPECTATIONS_WORD_BOUNDARIES = [
    { in: `144 Hz-skärm`, out: `144${markM(" ")}Hz-skärm` },
    { in: `144 Hza`, out: `144 Hza` },
    { in: `100 g kan`, out: `100${markM(" ")}g kan` },
    { in: `100 går`, out: `100 går` },
];

const EXPECTATIONS_CAPTURE_GROUPS = [
    { in: `A B C`, out: `A${markM(" ")}B C` },
    { in: `X Y Z`, out: `X Y${markM(" ")}Z` },
];

function test(expectations: ReadonlyArray<Expectation>): void {
    expectations.forEach(e => {
        expect(highlight(e.in)).toBe(e.out);
    });
}

it("provides the intended API", () => {
    expect(highlightMistakes("5 GHz")).toBe(`5${markM(" ")}GHz`);
    expect(highlightVerified("5&nbsp;GHz")).toBe(`5${markV("&nbsp;")}GHz`);
    expect(highlight("5&nbsp;GHz eller 4 GHz")).toBe(`5${markV("&nbsp;")}GHz eller 4${markM(" ")}GHz`);
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
