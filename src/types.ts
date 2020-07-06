export type KindOfMatch = 'break' | 'first' | 'last' | 'all';
export type RandomConstant = 'any_random_constant'
export type SimpleCompare<T, E = T> = (compare: T) => InnerCompare<E>;
export type ModCompare<T> = (mod: T, equals?: T) => InnerCompare<T>;
export type MultiCompare<T, E = T> = (a: T, b: T) => InnerCompare<E>;
export type InnerCompare<T> = (value: T) => boolean;
export type ThenType<T, E, F> = E | ((item: T, match: F) => E)
export type ArrayMatchType = 'any' | 'last' | 'some' | 'seek';
export type ArrayMatch<T> = { 'any': MatchValue<T> } |
	{ 'last': MatchValue<T>[] } |
	{ 'some': MatchValue<T>[] } |
	{ 'seek': MatchValue<T>[] } | 
	MatchValue<T>[];
export type DateCompareType = Date | string | number;

export type MatchStore<T, E> = Array<{ item: MatchValue<T>, then: ThenType<T, E, MatchValue<T>>, guard?: GuardMatch<T> }>
export type AllowedTo = [] | object | string | number | boolean;
export type MatchValue<T> = (T extends string
	? string | RegExp
	: (
		T extends number
		? number | InnerCompare<number>
		: (
			T extends boolean
			? boolean
			: (
				T extends Array<infer U>
				? ArrayMatch<U>
				: (
					T extends Date
					? string | number | Date | RegExp | InnerCompare<Date>
                    : (
						T extends Object
						? { [K in keyof T]?: MatchValue<T[K]> }
						: never
					)
				)
			)
		)
	)) | RandomConstant;

export interface InnerMatch<T extends AllowedTo, K extends KindOfMatch, E = void> {
	to: <F, U extends MatchValue<T> = MatchValue<T>>(item: U, then: ThenType<T, F, U>, guard?: GuardMatch<T>) => InnerMatch<T, K, F | E>;
	store: MatchStore<T, E>;
	solve: K extends 'all' ? () => E[] : () => E;
	kind: K;
};

export interface GuardMatch<T> {
	(item: T): boolean;
}