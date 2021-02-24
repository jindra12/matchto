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
 * Type of parameter of .then() function
 */
export interface ThenParams<T, E, F> {
	/**
	 * item which was matched
	 */
	item: T;
	/**
	 * Matched pattern
	 */
	matched: F;
	/**
	 * Allows for recursive pattern-matching
	 */
	rematch: (item: Simplify<T>) => E extends unknown ? Simplify<T> : E;
	/**
	 * Can extract variables defined by using the utility id()
	 */
	id: (index: string) => any;
}

/**
 * Custom non-typed function for resolving matches. If return value undefined, match continues as-is.
 */
export type PluginFn = (a: any, b: any) => (boolean | undefined);

/**
 * Function/value to be returned/executed when matching succeeds
 * @param params Results of pattern matching
 */
export type ThenType<T, E, F> = E | ((
	params: ThenParams<T, E, F>,
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
export type AllowedTo = [] | object | string | number | boolean | symbol | bigint | null | undefined;

/**
 * Pattern matching value
 */
export type MatchValue<T> = (T extends (null | undefined)
	? (null | undefined)
	: (
		T extends string
		? string | RegExp | ((value: string) => boolean) | StringConstructor
		: (
			T extends number
			? number | ((value: number) => boolean) | NumberConstructor
			: (
				T extends symbol
				? symbol | SymbolConstructor
				: (
					T extends bigint
					? bigint | BigIntConstructor
					: (
						T extends boolean
						? boolean | BooleanConstructor
						: (
							T extends Array<infer U>
							? ArrayMatch<U> | ArrayConstructor
							: (
								T extends Date
								? string | number | Date | RegExp | ((value: Date) => boolean) | DateConstructor
								: (
									T extends Object
									? { [K in keyof T]?: MatchValue<T[K]> } | (new (...args: any) => Simplify<T>) | ObjectConstructor
									: never
								)
							)
						)
					)
				)
			)
		)
	)) | RandomConstant | Identity;

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
	 */
	to: <F, U extends MatchValue<T> = MatchValue<T>>(item: U, then?: ThenType<T, F, U>) => InnerMatch<T, K, F | E>;
	/**
	 * Optional guard condition in last to() function call
	 */
	guard: (guard: GuardMatch<T>) => InnerMatch<T, K, E>;
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

type MergeAble = RandomConstant
	| Identity
	| RegExp
	| null
	| Function
	| StringConstructor
	| NumberConstructor
	| BooleanConstructor
	| DateConstructor
	| SymbolConstructor
	| BigIntConstructor
	| ArrayConstructor
	| ObjectConstructor;

export type MergerType<T, E> = E extends MergeAble 
	? T
	: (
		E extends Array<infer U>
			? (
				T extends Array<infer U1>
				? Array<MergerType<U1, U>>
				: never
			) : (
				E extends (string | number | boolean | Date | bigint | symbol)
				? E
				: (
					E extends object
					? (
						T extends object
						? { [K in (keyof E & keyof T)]: MergerType<T[K], E[K]> }
						: never
					) : never
				)
			)
	);