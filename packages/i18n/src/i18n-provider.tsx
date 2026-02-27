'use client';

import type { InitOptions, i18n } from 'i18next';

import { initializeI18nClient } from './i18n.client';

// Use globalThis to persist the i18n instance across Turbopack HMR
// module re-evaluations. Without this, module-level `let i18nInstance`
// gets reset to undefined every time Turbopack re-evaluates this module,
// causing an infinite Suspense retry loop.
const INSTANCE_KEY = Symbol.for('__kit_i18n_provider_instance__');

function getGlobalInstance(): i18n | undefined {
  return (globalThis as Record<symbol, unknown>)[INSTANCE_KEY] as
    | i18n
    | undefined;
}

function setGlobalInstance(instance: i18n) {
  (globalThis as Record<symbol, unknown>)[INSTANCE_KEY] = instance;
}

let i18nInstance: i18n | undefined = getGlobalInstance();

type Resolver = (
  lang: string,
  namespace: string,
) => Promise<Record<string, string>>;

export function I18nProvider({
  settings,
  children,
  resolver,
}: React.PropsWithChildren<{
  settings: InitOptions;
  resolver: Resolver;
}>) {
  useI18nClient(settings, resolver);

  return children;
}

/**
 * @name useI18nClient
 * @description A hook that initializes the i18n client.
 * @param settings
 * @param resolver
 */
function useI18nClient(settings: InitOptions, resolver: Resolver) {
  // Also re-check globalThis in case HMR reset the module-level variable
  if (!i18nInstance) {
    i18nInstance = getGlobalInstance();
  }

  if (
    !i18nInstance ||
    i18nInstance.language !== settings.lng ||
    i18nInstance.options.ns?.length !== settings.ns?.length
  ) {
    throw loadI18nInstance(settings, resolver);
  }

  return i18nInstance;
}

async function loadI18nInstance(settings: InitOptions, resolver: Resolver) {
  i18nInstance = await initializeI18nClient(settings, resolver);
  setGlobalInstance(i18nInstance);
}
