import i18next, { type InitOptions, i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

// Use globalThis to persist state across Turbopack HMR module re-evaluations.
// Module-level variables get reset when Turbopack re-evaluates the module,
// but globalThis persists across re-evaluations in the same browser tab.
const INIT_FLAG = Symbol.for('__kit_i18n_client_initialized__');

/**
 * Initialize the i18n instance on the client.
 * @param settings - the i18n settings
 * @param resolver - a function that resolves the i18n resources
 */
export async function initializeI18nClient(
  settings: InitOptions,
  resolver: (lang: string, namespace: string) => Promise<object>,
): Promise<i18n> {
  // If i18next was already initialized (even across HMR module re-evaluations),
  // return immediately. This prevents repeated .init() calls that don't
  // re-trigger the resourcesToBackend callback.
  if (i18next.isInitialized) {
    return i18next;
  }

  // Also check our globalThis flag — if a previous module evaluation
  // initialized i18next but the singleton reference was lost to HMR,
  // we still know init happened.
  if ((globalThis as Record<symbol, unknown>)[INIT_FLAG] === true) {
    // Re-run init to ensure plugins are wired up for this module evaluation
    await i18next
      .use(initReactI18next)
      .init({
        ...settings,
        interpolation: { escapeValue: false },
      });

    return i18next;
  }

  await i18next
    .use(
      resourcesToBackend(async (language, namespace, callback) => {
        try {
          const data = await resolver(language, namespace);
          callback(null, data);
        } catch (err) {
          console.error(`[i18n] Failed to load ${language}/${namespace}:`, err);
          callback(err as Error, {});
        }
      }),
    )
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(
      {
        ...settings,
        detection: {
          order: ['htmlTag', 'cookie', 'navigator'],
          caches: ['cookie'],
          lookupCookie: 'lang',
        },
        interpolation: {
          escapeValue: false,
        },
      },
      (err) => {
        if (err) {
          console.error('Error initializing i18n client', err);
        }
      },
    );

  // Mark as initialized in globalThis so it persists across HMR
  (globalThis as Record<symbol, unknown>)[INIT_FLAG] = true;

  return i18next;
}
