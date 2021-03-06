import { InnerMatch, KindOfMatch, MatchValue, AllowedTo, ThenType } from "./types";
import { matchAll } from "./utils/match";

/**
 * Pass a value you would like to perform pattern matching on
 * @param to value to be matched
 * @param type type of pattern matching, more in KindOfMatch docs.
 * @param plugins any custom functions which will trigger every time during recursive match. They can return true/false/undefined - undefined means that the rest of algo runs.
 * @returns builder pattern object to use for pattern matching
 */
export const match = <T extends AllowedTo, K extends KindOfMatch = 'first'>(
    to: T,
    type?: K,
    plugins?: Array<(a: any, b: any) => (boolean | undefined)>,
): (
    K extends 'first'
        ? InnerMatch<T, 'first', void>
        : (
            K extends 'last'
                ? InnerMatch<T, 'last', void>
                : (
                    K extends 'break'
                        ? InnerMatch<T, 'break', void>
                        : (
                            K extends 'all'
                                ? InnerMatch<T, 'all', void>
                                : never
                        )
                )
        )
) => {
    const innerMatch: InnerMatch<T, K, void> = ({
        kind: type as any,
        store: [],
        to: <F, U extends MatchValue<T> = MatchValue<T>>(item: U, then?: ThenType<T, F, U>) => {
            innerMatch.store.push({ item, then: (then || true) as any, not: false });
            return innerMatch as any;
        },
        guard: condition => {
            if (innerMatch.store.length > 0) {
                innerMatch.store[innerMatch.store.length - 1].guard = condition;
            }
            return innerMatch;
        },
        not: () => {
            if (innerMatch.store.length > 0) {
                innerMatch.store[innerMatch.store.length - 1].not = true;
            }
            return innerMatch;
        },
        cut: () => {
            if (innerMatch.store.length > 0) {
                innerMatch.store[innerMatch.store.length - 1].cut = true;
            }
            return innerMatch;
        },
        solve: (type === 'all'
            ? () => matchAll(to, innerMatch.store, 'all', innerMatch, plugins || [])
            : () => matchAll(to, innerMatch.store, type || 'first', innerMatch, plugins || [])[0]) as any,
    });
    return innerMatch as any;
};
