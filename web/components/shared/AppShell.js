/**
 * @typedef {Object} AppShellContextValue
 * @property {string} language
 * @property {(lang: string) => void} setLanguage
 * @property {import("@/lib/clientAuth").AuthUser | null} user
 * @property {string | null} token
 * @property {(token: string, user: import("@/lib/clientAuth").AuthUser) => void} setSession
 * @property {() => void} logout
 */
