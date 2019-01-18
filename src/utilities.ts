export const id = <T>(x: T) => x;

export function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C {
    return x => f(g(x));
}

export type StringTransformer = (x: string) => string;

export type Maybe<T> = T | null;

export function fmap<A, B>(f: (x: A) => B): (mx: Maybe<A>) => Maybe<B> {
    return mx => mx === null ? null : f(mx);
}
