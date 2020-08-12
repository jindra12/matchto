import { InnerMatch, AllowedTo, KindOfMatch } from "../types";
import match from "..";

export const recursive = <T extends AllowedTo, E, K extends KindOfMatch>(matcher: InnerMatch<T, K, E>) => (item: T) => {
    const newMatcher = match(item);
    newMatcher.store = [...matcher.store] as any;
    newMatcher.kind = matcher.kind as any;
    return newMatcher.solve();
};