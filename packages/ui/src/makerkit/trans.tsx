'use client';

import { useTranslation } from 'react-i18next';

/**
 * Isomorphic Trans wrapper that avoids the hydration mismatch caused by
 * Turbopack isolating react-i18next/TransWithoutContext from the i18n
 * instance set via react-i18next/initReactI18next on the server.
 *
 * Uses the context-aware useTranslation() hook so that both server SSR
 * and client rendering resolve translations identically.
 */
export function Trans(props: {
  i18nKey?: string;
  defaults?: string;
  values?: Record<string, unknown>;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();

  const key = props.i18nKey ?? '';

  // t() returns the translated text or falls back to defaults/key
  const text = t(key, {
    defaultValue: props.defaults ?? key,
    ...props.values,
  });

  return <>{text}</>;
}
