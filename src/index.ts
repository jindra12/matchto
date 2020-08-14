import { match } from './matcher';

export { Any, mod, more, moreOrEqual, less, lessOrEqual, after, afterOrNow, around, before, beforeOrNow, between } from './utils/comparators';
export { id } from './utils/identity';
export { merge } from './utils/merger';
export default match;
