/*
IMPORTANT ABOUT PATTERNS:

If a pattern contains no capture groups, the entire match will have highlighting
applied. Note that (...) is a capture group, but (?:...) is not. Examples:

    /Mini-ITX/
    /\d [kMG]?(?:b|bit|B|byte)|4K UHD/

If a pattern contains one or more capture groups, only the string captured by
the FIRST MATCHING capture group will have highlighting applied. Example:

    /(\d \d{3}) /

With this pattern, "8 500 " will be replaced by "8_500 ", where _ means NBSP.
Without the capture group, it would have been replaced with "8_500_".

Another example:

    /(\d \d{3}) |(\d B) /

This pattern contains two capture groups, but that's fine: "8 500 " will be
replaced by "8_500 ", just like above, AND "2 B " will be replaced by "2_B ".
*/

/*
Specifies a substring that should be highlighted as a mistake in some contexts,
described as a list of regular expressions.
*/
export type Mistake = Readonly<{
    contexts: ReadonlyArray<RegExp>, // e.g. [ /\d [kMG]?(?:bit|B)/, /4K UHD/ ]
    substring?: string, // e.g. " "; undefined means replace everything
    info?: string, // e.g. "non-breaking space", can be used for tooltips etc
}>;

export type StringTransformer = (x: string) => string;

const NO_INFO = null;

export function highlightWith(c: {
    mistakes: ReadonlyArray<Mistake>,
    verify: RegExp,
    identifiers: Readonly<{ mistake: string, verified: string }>,
    markWith: (identifier: string) => (info: string | null) => StringTransformer,
}): StringTransformer {
    // Must do it in this order to avoid cluttering text with "verified" markers
    // before finding mistakes.
    return compose(
        highlightVerifiedWith(c.verify, c.markWith(c.identifiers.verified)(NO_INFO)),
        highlightMistakesWith(c.mistakes, c.markWith(c.identifiers.mistake)),
    );
}

export function highlightMistakesWith(
    mistakes: ReadonlyArray<Mistake>,
    mark: (info: string | null) => StringTransformer,
): StringTransformer {
    function replacer(info: string | null, substring?: string) {
        // If substring is undefined, highlight entire phrase:
        const transform = (
            substring === undefined
            ? mark(info)
            : (s: string) => s.split(substring).join(mark(info)(substring))
        );
        return (match: string, ...rest: Array<string | number | undefined>) => {
            const captured = rest.find(x => x !== undefined);
            // If captured is a string, it is the one matched by the first
            // capture group in the context in question. Otherwise, it will be a
            // number, namely an irrelevant offset. In that case, the context
            // contained no capture group and the entire match should be used.
            // undefineds in rest arise from other contexts with capture groups.
            return (
                typeof captured === "string"
                ? match.replace(captured, transform(captured))
                : transform(match)
            );
        };
    }
    const transformers = mistakes.map(m =>
        (text: string) => text.replace(join(m.contexts), replacer(m.info || null, m.substring))
    );
    return transformers.reduceRight(compose, x => x);
}

export function highlightVerifiedWith(
    pattern: RegExp,
    mark: StringTransformer,
): StringTransformer {
    return text => text.replace(pattern, mark);
}

function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C {
    return x => f(g(x));
}

function join(patterns: ReadonlyArray<RegExp>): RegExp {
    return new RegExp(patterns.map(p => p.source).join("|"), "g");
}
