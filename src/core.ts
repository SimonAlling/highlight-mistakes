import {
    Rule,
} from "./rules";
import {
    Maybe,
    StringTransformer,
    compose,
    id,
} from "./utilities";

export type Lookaround = "native" | "group" | "none";

export const LOOKAROUND_DEFAULT = "group";

export type ProofreadingConfig = Readonly<{
    rules: ReadonlyArray<Rule>,
    markMistake: (info: Maybe<string>) => StringTransformer,
    markVerified: (info: Maybe<string>) => StringTransformer,
    lookaround?: Lookaround,
}>;

export function highlightWith(c: Readonly<{
    pattern: RegExp,
    mark: StringTransformer,
}>): StringTransformer {
    return text => text.replace(c.pattern, c.mark);
}

export function proofreadWith(c: ProofreadingConfig) {
    const transformers = c.rules.map(markMistakesAndVerifiedUsing({
        lookaround: c.lookaround || LOOKAROUND_DEFAULT,
        ...c,
    }));
    // reduceRight so that rules can be declared with descending specificity:
    return transformers.reduceRight(compose, id);
}

export function markMistakesAndVerifiedUsing(c: Readonly<{
    markMistake: (info: Maybe<string>) => StringTransformer,
    markVerified: (info: Maybe<string>) => StringTransformer,
    lookaround: Lookaround,
}>): (r: Rule) => StringTransformer {
    return r => compose(
        markAll("verified", c.markVerified, c.lookaround)(r),
        markAll("mistakes", c.markMistake, c.lookaround)(r),
    );
}

export function markAll(
    kind: "mistakes" | "verified",
    mark: (info: Maybe<string>) => StringTransformer,
    lookaround: Lookaround,
): (r: Rule) => StringTransformer {
    return r => {
        const before = r.before === null ? "" : r.before.source;
        const after = r.after === null ? "" : r.after.source;
        // Before, match, after:
        const [ f_b, f_m, f_a ] = (
            lookaround === "native"
            ? [ lookbehind, id, lookahead ]
            : (
                lookaround === "group"
                ? [ group, group, group ]
                : [ id, id, id ]
            )
        );
        const whatToFind = new RegExp(
            kind === "mistakes"
            ? f_b(before) + f_m(r.match.source                          ) + f_a(after)
            : f_b(before) + f_m(r.match.source.split(r.bad).join(r.good)) + f_a(after)
        , "g");
        const whatToMark = kind === "mistakes" ? r.bad : r.good;
        return findAndMarkUsing(whatToFind, whatToMark, mark, r.info, lookaround === "group");
    };
}

function group(r: string): string {
    return "(" + r + ")";
}

function lookahead(r: string): string {
    return "(?=" + r + ")";
}

function lookbehind(r: string): string {
    return "(?<=" + r + ")";
}

function findAndMarkUsing(
    whatToFind: RegExp,
    whatToMark: string,
    mark: (info: Maybe<string>) => StringTransformer,
    info: Maybe<string>,
    fakeLookaround: boolean,
): StringTransformer {
    function markIn(s: string): string {
        return s.split(whatToMark).join(mark(info)(whatToMark));
    }
    return text => text.replace(
        whatToFind,
        (found, ...rest: Array<string | number | undefined>) => {
            if (fakeLookaround) {
                // Should start with three strings in this case, since
                // fakeLookaround means we have three capture groups:
                const captured = rest.slice(0, 3) as Array<string>;
                return captured[0] + markIn(captured[1]) + captured[2];
            } else {
                return markIn(found);
            }
        },
    );
}
