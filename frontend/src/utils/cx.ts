/**
 * Lightweight class-name joiner — replaces tailwind-merge.
 * Filters out falsy values and joins the rest with a space.
 */
export const cx = (...classes: (string | undefined | null | false)[]): string =>
    classes.filter(Boolean).join(" ");

/**
 * Alias kept for compatibility with any sortCx usage.
 */
export function sortCx<T extends Record<string, string | number | Record<string, string | number | Record<string, string | number>>>>(classes: T): T {
    return classes;
}
