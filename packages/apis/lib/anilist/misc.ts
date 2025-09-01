import type { FuzzyDateGenqlSelection } from 'aniql';

export const fuzzy_date = { __scalar: true } satisfies FuzzyDateGenqlSelection;

export const _clean_top = <T>(items: Array<T | null>) => items.filter((i) => i !== null);
