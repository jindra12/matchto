import { InnerMatch, KindOfMatch, MatchValue, AllowedTo, ThenType } from "./types";
import { matchAll } from "./utils/utils";

export const match = <T extends AllowedTo, K extends KindOfMatch = 'first'>(
    to: T,
    type?: K,
): (
    K extends 'first'
        ? InnerMatch<T, 'first', void>
        : (
            K extends 'last'
                ? InnerMatch<T, 'last', void>
                : (
                    K extends 'break'
                        ? InnerMatch<T, 'break', 'void'>
                        : (
                            K extends 'all'
                                ? InnerMatch<T, 'all', 'void'>
                                : never
                        )
                )
        )
) => {
    const innerMatch: InnerMatch<T, K, void> = ({
        kind: type as any,
        store: [],
        to: <F, U extends MatchValue<T> = MatchValue<T>>(item: U, then: ThenType<T, F, U>, guard?: (item: T) => boolean) => {
            innerMatch.store.push({ item, then: then as any, guard });
            return innerMatch as any;
        },
        solve: (type === 'all'
            ? () => matchAll(to, innerMatch.store, 'all')
            : () => matchAll(to, innerMatch.store, type || 'first')[0]) as any,
    });
    return innerMatch as any;
};
