import { Identity } from "./utils/identity";

/**
 * What kind of pattern matching do you have in mind?
 * break - will throw an exception if more than one pattern is matched
 * first (default) - will end after the first matched pattern
 * last - reverse of the first
 * all - will return an array of all then() fn calls/values of matched patterns
 */
export type KindOfMatch = 'break' | 'first' | 'last' | 'all';

/**
 * Random constant which will match any value
 */
export type RandomConstant = 'any_random_constant'

/**
 * Function/value to be returned/executed when matching succeeds
 * @param item item which was matched
 * @param match Matched pattern
 * @param rematch allows for recursive pattern-matching.
 * @param id Can extract variables defined by using the utility id()
 */
export type ThenType<T, E, F> = E | ((
	item: T,
	match: F,
	rematch: (item: Simplify<T>) => E extends unknown ? Simplify<T> : E,
	id: (index: string) => any
) => E);

export type ArrayMatchType = 'any' | 'last' | 'some' | 'seek';
/**
 * Extra options for matching arrays
 */
export type ArrayMatch<T> = { 'any': MatchValue<T> } |
{ 'last': MatchValue<T>[] } |
{ 'some': MatchValue<T>[] } |
{ 'seek': MatchValue<T>[] } |
	MatchValue<T>[];
export type DateCompareType = Date | string | number;

export type MatchStore<T, E> = Array<{ item: MatchValue<T>, then: ThenType<T, E, MatchValue<T>>, guard?: GuardMatch<T>, not?: boolean, cut?: boolean }>
export type AllowedTo = [] | object | string | number | boolean;

/**
 * Pattern matching value
 */
export type MatchValue<T> = (T extends null
	? null
	: (
		T extends string
		? string | RegExp | ((value: string) => boolean)
		: (
			T extends number
			? number | ((value: number) => boolean)
			: (
				T extends boolean
				? boolean
				: (
					T extends Array<infer U>
					? ArrayMatch<U>
					: (
						T extends Date
						? string | number | Date | RegExp | ((value: Date) => boolean)
						: (
							T extends Object
							? { [K in keyof T]?: MatchValue<T[K]> }
							: never
						)
					)
				)
			)
		)
	)
) | RandomConstant | Identity;

export type Simplify<T> = T extends boolean
	? boolean
	: (
		T extends number
			? number
			: (
				T extends string
				? string
				: (
					T extends object ? T : never
				)
			)
	);

/**
 * Pattern matching builder
 */
export interface InnerMatch<T extends AllowedTo, K extends KindOfMatch, E = void> {
	/**
	 * Define a pattern to match to. Then, you can define a method or value to return/execute when pattern matches.
	 * @param item pattern
	 * @param then function or value to return/execute
	 * @param guard optional guard condition
	 */
	to: <F, U extends MatchValue<T> = MatchValue<T>>(item: U, then: ThenType<T, F, U>, guard?: GuardMatch<T>) => InnerMatch<T, K, F | E>;
	/**
	 * Negates the match setup in last to() function call
	 */
	not: () => InnerMatch<T, K, E>;
	/**
	 * Creates a prolog-like cut in last to() function call
	 */
	cut: () => InnerMatch<T, K, E>;
	store: MatchStore<T, E>;
	/**
	 * Execute the pattern match
	 */
	solve: K extends 'all' ? () => E[] : () => E;
	kind: K;
};

/**
 * Pattern match guard function
 */
export interface GuardMatch<T> {
	(item: T): boolean;
}

export interface IdentityMap {
	[key: string]: Identity[];
}