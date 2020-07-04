export type KindOfMatch = 'break' | 'first' | 'last' | 'all';
export type RandomConstant = 'any_random_constant'

export type MatchStore<T, E> = Array<{ item: MatchValue<T>, then: E | ((item: T) => E), guard?: GuardMatch<T> }>
export type AllowedTo = [] | object | string | number | boolean;
export type MatchValue<T> = (T extends string
	? string | RegExp
	: (
		T extends number
		? number
		: (
			T extends boolean
			? boolean
			: (
				T extends Array<infer U>
				? MatchValue<U>[] | { 'any': MatchValue<U> }
				: (
					T extends Date
					? string | number | Date | RegExp
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
	to: <F>(item: MatchValue<T>, then: F | ((item: T) => F), guard?: GuardMatch<T>) => InnerMatch<T, K, F | E>;
	store: MatchStore<T, E>;
	solve: K extends 'all' ? () => E[] : () => E;
	kind: K;
};

export interface GuardMatch<T> {
	(item: T): boolean;
}