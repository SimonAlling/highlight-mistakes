import {
  markMistakesAndVerifiedUsing,
  proofreadWith,
  highlightWith
} from "../src/core";
import { StringTransformer } from "../src/utilities";
import { NO_INFO, simpleRule } from "../src/rules";
import * as exported from "../src/index";

import {
  PATTERN_DOPPELGANGERS,
  RULE_NBSP_4K,
  RULE_NBSP_GTX,
  RULE_NBSP_GEFORCE_GTX,
  RULE_NBH_DATES,
  RULE_END_INTERVALS,
  RULE_SUP2,
  RULES
} from "./rules";

function markAs(
  identifier: string
): (info: string | null) => StringTransformer {
  return info => s =>
    [
      `<${identifier}`,
      info === null ? "" : ` title="${info}"`,
      `>`,
      s,
      `</${identifier}>`
    ].join("");
}

const markMistake = markAs("mis");
const markVerified = markAs("ver");
const markUnknown = markAs("any")(NO_INFO);

const missingNBSP = markMistake("NBSP")(" ");
const verifiedNBSP = markVerified("NBSP")("&nbsp;");
const missingNBH = markMistake("NBH")("-");
const verifiedNBH = markVerified("NBH")("‑");

type Expectation = Readonly<{ in: string; out: string }>;

const highlightDoppelgangers = highlightWith({
  pattern: PATTERN_DOPPELGANGERS,
  mark: markUnknown
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
  { in: `5&nbsp;`, out: `5&nbsp;` }
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

const lookaround = "none";

const applyRule = markMistakesAndVerifiedUsing({
  markMistake,
  markVerified,
  lookaround
});

const proofread = proofreadWith({
  rules: RULES,
  markMistake,
  markVerified,
  lookaround
});

it("works for literal rules", () => {
  expect(
    applyRule(RULE_NBSP_4K)("4K UHD eller 4K&nbsp;UHD")
  ).toMatchInlineSnapshot(
    `"4K<mis title=\\"NBSP\\"> </mis>UHD eller 4K<ver title=\\"NBSP\\">&nbsp;</ver>UHD"`
  );
  expect(
    applyRule(RULE_SUP2)("hello <sup>2</sup> world")
  ).toMatchInlineSnapshot(`"hello <mis><sup>2</sup></mis> world"`);
});

it("works for simple rules", () => {
  expect(
    applyRule(RULE_NBSP_GTX)("GTX 1080 eller GTX&nbsp;1080")
  ).toMatchInlineSnapshot(
    `"GTX<mis title=\\"NBSP\\"> </mis>1080 eller GTX<ver title=\\"NBSP\\">&nbsp;</ver>1080"`
  );
});

it("works for match rules", () => {
  expect(
    applyRule(RULE_NBSP_GEFORCE_GTX)(
      "Geforce GTX 1080 eller Geforce&nbsp;GTX&nbsp;1080"
    )
  ).toMatchInlineSnapshot(
    `"Geforce<mis title=\\"NBSP\\"> </mis>GTX<mis title=\\"NBSP\\"> </mis>1080 eller Geforce<ver title=\\"NBSP\\">&nbsp;</ver>GTX<ver title=\\"NBSP\\">&nbsp;</ver>1080"`
  );
});

it("works for regex rules", () => {
  expect(
    applyRule(RULE_END_INTERVALS)("med 2-3 stycken")
  ).toMatchInlineSnapshot(`"med 2<mis title=\\"END\\">-</mis>3 stycken"`);
  expect(
    applyRule(RULE_END_INTERVALS)("med 2–3 stycken")
  ).toMatchInlineSnapshot(`"med 2<ver title=\\"END\\">–</ver>3 stycken"`);
  // Regular hyphens:
  expect(applyRule(RULE_END_INTERVALS)("2018-12-24")).toMatchInlineSnapshot(
    `"2018-12-24"`
  );
  // Regular hyphen, en dash:
  expect(applyRule(RULE_END_INTERVALS)("2018-12–24")).toMatchInlineSnapshot(
    `"2018-12–24"`
  );
  // Regular hyphens:
  expect(applyRule(RULE_NBH_DATES)("2018-12-24")).toMatchInlineSnapshot(
    `"2018<mis title=\\"NBH\\">-</mis>12<mis title=\\"NBH\\">-</mis>24"`
  );
  // Non-breaking hyphens:
  expect(applyRule(RULE_NBH_DATES)("2018‑12‑24")).toMatchInlineSnapshot(
    `"2018<ver title=\\"NBH\\">‑</ver>12<ver title=\\"NBH\\">‑</ver>24"`
  );
});

it("behaves differently with respect to the order of interfering rules", () => {
  expect(
    proofreadWith({
      rules: [RULE_NBSP_GTX, RULE_NBSP_GEFORCE_GTX],
      markMistake,
      markVerified,
      lookaround
    })("Geforce GTX 1080")
  ).toMatchInlineSnapshot(`"Geforce GTX<mis title=\\"NBSP\\"> </mis>1080"`);
  expect(
    proofreadWith({
      rules: [RULE_NBSP_GEFORCE_GTX, RULE_NBSP_GTX],
      markMistake,
      markVerified,
      lookaround
    })("Geforce GTX 1080")
  ).toMatchInlineSnapshot(
    `"Geforce<mis title=\\"NBSP\\"> </mis>GTX<mis title=\\"NBSP\\"> </mis>1080"`
  );
});

it("can highlight only some NBSPs in a match", () => {
  expect(proofread("A B C")).toMatchInlineSnapshot(
    `"A<mis title=\\"NBSP\\"> </mis>B C"`
  );
  expect(proofread("X Y Z")).toMatchInlineSnapshot(
    `"X Y<mis title=\\"NBSP\\"> </mis>Z"`
  );
});

it("can use lookaround", () => {
  const conf = {
      rules: [
        simpleRule({ good: "&nbsp;", bad: " ", info: "NBSP" })(/A/, /B C/)
      ],
      markMistake,
      markVerified,
  };
  expect(
    proofreadWith({ lookaround: "native", ...conf })("A B C")
  ).toMatchInlineSnapshot(`"A<mis title=\\"NBSP\\"> </mis>B C"`);
  expect(
    proofreadWith({ lookaround: "group", ...conf })("A B C")
  ).toMatchInlineSnapshot(
    `"A<mis title=\\"NBSP\\"> </mis>B C"`
  );
  expect(
    proofreadWith({ lookaround: "none", ...conf })("A B C")
  ).toMatchInlineSnapshot(
    `"A<mis title=\\"NBSP\\"> </mis>B<mis title=\\"NBSP\\"> </mis>C"`
  );
});

function test(expectations: ReadonlyArray<Expectation>): void {
  expectations.forEach(e => {
    expect(proofread(e.in)).toBe(e.out);
  });
}

it("provides the intended API", () => {
  expect(exported.proofreadWith).toBeDefined();
  expect(exported.highlightWith).toBeDefined();
  expect(exported.literalRule).toBeDefined();
  expect(exported.simpleRule).toBeDefined();
  expect(exported.matchRule).toBeDefined();
  expect(exported.regexRule).toBeDefined();
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

it("can highlight doppelgangers correctly", () => {
  expect(
    highlightDoppelgangers(`hello&nbsp;world‑program`)
  ).toMatchInlineSnapshot(`"hello<any>&nbsp;</any>world<any>‑</any>program"`);
});
