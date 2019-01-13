import {
  proofreadWith,
  highlightWith,
  verificationRegexFor,
  mistakesRegexFor,
  NO_INFO
} from "../src/core";
import * as exported from "../src/index";

import { PATTERN_DOPPELGANGERS, RULES } from "./patterns";

const CLASS_MIS = "mis";
const CLASS_VER = "ver";
const CLASS_ANY = "any";

function markWith(
  className: string
): (info: string | null) => (s: string) => string {
  return info => s =>
    [
      `<pre class="`,
      className,
      `"`,
      info ? ` title="${info}"` : "",
      `>`,
      s,
      `</pre>`
    ].join("");
}

const markM = markWith(CLASS_MIS);
const markV = markWith(CLASS_VER)(NO_INFO);
const markA = markWith(CLASS_ANY)(NO_INFO);

const missingNBSP = markM(NO_INFO)(" ");
const verifiedNBSP = markV("&nbsp;");
const missingNBH = markM("non-breaking hyphen")("-");
const verifiedNBH = markV("‑");
const verifiedTimes = markV("×");

type Expectation = Readonly<{ in: string; out: string }>;

const highlightDoppelgangers = highlightWith({
  pattern: PATTERN_DOPPELGANGERS,
  mark: markA
});

const proofread = proofreadWith({
  rules: RULES,
  identifiers: { mistake: CLASS_MIS, verified: CLASS_VER },
  markWith
});

const EXPECTATIONS_MISTAKES_NB_SPACE = [
  { in: `5 GHz`, out: `5${missingNBSP}GHz` },
  { in: `at 5 GHz.`, out: `at 5${missingNBSP}GHz.` },
  { in: `a 5 GHz CPU`, out: `a 5${missingNBSP}GHz CPU` }
];

const EXPECTATIONS_VERIFIED_NB_SPACE = [
  { in: `5&nbsp;GHz`, out: `5${verifiedNBSP}GHz` },
  { in: `at 5&nbsp;GHz.`, out: `at 5${verifiedNBSP}GHz.` },
  { in: `a 5&nbsp;GHz CPU`, out: `a 5${verifiedNBSP}GHz CPU` }
];

const EXPECTATIONS_UNKNOWN_NB_SPACE = [
  { in: `hello&nbsp;world`, out: `hello&nbsp;world` },
  { in: `5&nbsp;`, out: `5&nbsp;` },
];

const EXPECTATIONS_BOTH = [
  {
    in: `5&nbsp;GHz eller 4 GHz`,
    out: `5${verifiedNBSP}GHz eller 4${missingNBSP}GHz`
  }
];

const EXPECTATIONS_MISTAKES_NB_HYPHEN = [
  { in: `G-Sync`, out: `G${missingNBH}Sync` },
  { in: `i7-8700K`, out: `i7${missingNBH}8700K` }
];

const EXPECTATIONS_VERIFIED_NB_HYPHEN = [
  { in: `G‑Sync`, out: `G${verifiedNBH}Sync` },
  { in: `i7‑8700K`, out: `i7${verifiedNBH}8700K` }
];

const EXPECTATIONS_DIFFERENT_MISTAKES = [
  { in: `Core i7-8700K`, out: `Core${missingNBSP}i7${missingNBH}8700K` },
  { in: `Core i7‑8700K`, out: `Core${missingNBSP}i7${verifiedNBH}8700K` },
  { in: `Core&nbsp;i7-8700K`, out: `Core${verifiedNBSP}i7${missingNBH}8700K` },
  { in: `Core&nbsp;i7‑8700K`, out: `Core${verifiedNBSP}i7${verifiedNBH}8700K` }
];

const EXPECTATIONS_WORD_BOUNDARIES = [
  { in: `144 Hz-skärm`, out: `144${missingNBSP}Hz-skärm` },
  { in: `144 Hza`, out: `144 Hza` },
  { in: `100 g kan`, out: `100${missingNBSP}g kan` },
  { in: `100 går`, out: `100 går` }
];

const EXPECTATIONS_CAPTURE_GROUPS = [
  { in: `A B C`, out: `A${missingNBSP}B C` },
  { in: `X Y Z`, out: `X Y${missingNBSP}Z` }
];

function test(expectations: ReadonlyArray<Expectation>): void {
  expectations.forEach(e => {
    expect(proofread(e.in)).toBe(e.out);
  });
}

it("provides the intended API", () => {
  expect(exported.proofreadWith).toBeDefined();
});

it("creates verification regexes correctly", () => {
  expect(verificationRegexFor(RULES[0])).toMatchInlineSnapshot(
    `/\\(\\\\d\\+&nbsp;\\[nµmcdkMGTP\\]\\?\\(\\?:g\\|m\\|Hz\\|b\\|bit\\|B\\|byte\\|V\\|W\\|Wh\\|%\\)\\)\\(\\?:\\$\\|\\[\\^\\\\wåäöé\\]\\)\\|Core&nbsp;i\\\\d\\|\\(A&nbsp;B\\) C\\|X&nbsp;\\(Y Z\\)/g`
  );
});

it("creates mistakes regexes correctly", () => {
  expect(mistakesRegexFor(RULES[0])).toMatchInlineSnapshot(
    `/\\(\\\\d\\+ \\[nµmcdkMGTP\\]\\?\\(\\?:g\\|m\\|Hz\\|b\\|bit\\|B\\|byte\\|V\\|W\\|Wh\\|%\\)\\)\\(\\?:\\$\\|\\[\\^\\\\wåäöé\\]\\)\\|Core i\\\\d\\|\\(A B\\) C\\|X \\(Y Z\\)/g`
  );
});

it("can highlight missing NBSPs", () => {
  test(EXPECTATIONS_MISTAKES_NB_SPACE);
});

it("can highlight verified NBSPs", () => {
  test(EXPECTATIONS_VERIFIED_NB_SPACE);
});

it("leaves other NBSPs untouched", () => {
  test(EXPECTATIONS_UNKNOWN_NB_SPACE);
});

it("can highlight both missing and verified NBSPs", () => {
  test(EXPECTATIONS_BOTH);
});

it("can highlight missing non-breaking hyphens", () => {
  test(EXPECTATIONS_MISTAKES_NB_HYPHEN);
});

it("can highlight verified non-breaking hyphens", () => {
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

it("can highlight doppelgangers correctly", () => {
  expect(highlightDoppelgangers(`hello&nbsp;world`)).toMatchInlineSnapshot(
    `"hello<pre class=\\"any\\">&nbsp;</pre>world"`
  );
});
