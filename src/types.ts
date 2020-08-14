import { Identity } from "./utils/identity";

export type KindOfMatch = 'break' | 'first' | 'last' | 'all';
export type RandomConstant = 'any_random_constant'
export type ThenType<T, E, F> = E | ((
	item: T,
	match: F,
	rematch: (item: Simplify<T>) => E extends unknown ? Simplify<T> : E,
	id: (index: string) => any
) => E);

export type ArrayMatchType = 'any' | 'last' | 'some' | 'seek';
export type ArrayMatch<T> = { 'any': MatchValue<T> } |
{ 'last': MatchValue<T>[] } |
{ 'some': MatchValue<T>[] } |
{ 'seek': MatchValue<T>[] } |
	MatchValue<T>[];
export type DateCompareType = Date | string | number;

export type MatchStore<T, E> = Array<{ item: MatchValue<T>, then: ThenType<T, E, MatchValue<T>>, guard?: GuardMatch<T>, not?: boolean, cut?: boolean }>
export type AllowedTo = [] | object | string | number | boolean;
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

export interface InnerMatch<T extends AllowedTo, K extends KindOfMatch, E = void> {
	to: <F, U extends MatchValue<T> = MatchValue<T>>(item: U, then: ThenType<T, F, U>, guard?: GuardMatch<T>) => InnerMatch<T, K, F | E>;
	not: () => InnerMatch<T, K, E>;
	cut: () => InnerMatch<T, K, E>;
	store: MatchStore<T, E>;
	solve: K extends 'all' ? () => E[] : () => E;
	kind: K;
};

export interface GuardMatch<T> {
	(item: T): boolean;
}

export interface IdentityMap {
	[key: string]: Identity;
}