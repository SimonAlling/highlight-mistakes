import escapeRegex from "escape-string-regexp";

import {
    Maybe,
    fmap,
} from "./utilities";

export const NO_INFO = null;

export type RuleCore = Readonly<{
    bad: string,
    good: string,
    info: Maybe<string>,
}>;

export type Rule = RuleCore & Readonly<{
    before: Maybe<RegExp>,
    match: RegExp,
    after: Maybe<RegExp>,
}>;

export function literalRule(core: RuleCore): (before: Maybe<string>, after: Maybe<string>) => Rule {
    const literal = fmap(literalRegex);
    return (before, after) => simpleRule(core)(literal(before), literal(after));
}

export function simpleRule(core: RuleCore): (before: Maybe<RegExp>, after: Maybe<RegExp>) => Rule {
    return (before, after) => matchRule(core)(before, literalRegex(core.bad), after);
}

export function matchRule(core: RuleCore): (before: Maybe<RegExp>, match: RegExp, after: Maybe<RegExp>) => Rule {
    return (before, match, after) => ({
        before,
        match,
        after,
        ...core,
    });
}

export function regexRule(core: RuleCore): (regex: RegExp) => Rule {
    return regex => ({
        before: null,
        match: regex,
        after: null,
        ...core,
    });
}

function literalRegex(s: string): RegExp {
    return new RegExp(escapeRegex(s));
}
