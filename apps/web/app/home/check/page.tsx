'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { AlertTriangle, CheckCircle, MapPin, Search, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface AddressData {
  place_id: string;
  formatted_address: string;
  street_number: string;
  route: string;
  locality: string;
  postal_code: string;
  country: string;
  unit_number: string;
  lat: number;
  lng: number;
  address_quality_score: number;
}

type SuggestionItem = {
  place_id: string;
  description: string;
};

// ── Score helpers ──────────────────────────────────────────────────────────
function computeScore(c: Partial<AddressData>): number {
  let s = 0;
  if (c.place_id) s += 30;
  if (c.street_number) s += 20;
  if (c.route) s += 20;
  if (c.locality) s += 10;
  if (c.postal_code) s += 10;
  if (c.country) s += 5;
  if (c.street_number && c.route && c.locality && c.postal_code) s += 5;
  return Math.min(100, s);
}

function scoreColor(score: number | null) {
  if (score === null) return 'bg-gray-200';
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
}

function scoreLabel(score: number | null) {
  if (score === null) return '';
  if (score >= 90) return 'Verified';
  if (score >= 70) return 'Partial Match';
  return 'Low Quality';
}

// ── Main Component ────────────────────────────────────────────────────────
export default function CheckPage() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [unitNumber, setUnitNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // Modal states
  const [showWarnModal, setShowWarnModal] = useState(false);   // 70-89: soft warning
  const [showBlockModal, setShowBlockModal] = useState(false); // <70: hard block

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Load Google Maps ──────────────────────────────────────────────────
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      setApiReady(false);
      return;
    }

    setOptions({ apiKey, version: 'weekly' });

    importLibrary('places').then(() => {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      const dummy = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(
        dummy,
      );
      setApiReady(true);
    });
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Debounced autocomplete ─────────────────────────────────────────────
  const fetchSuggestions = useCallback(
    (value: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        if (!apiReady || !autocompleteService.current) {
          setSuggestions([
            {
              place_id: 'stub_1',
              description: `${value} - Smithtown, NY 11787, USA`,
            },
            {
              place_id: 'stub_2',
              description: `${value} - Huntington, NY 11743, USA`,
            },
          ]);
          return;
        }

        autocompleteService.current.getPlacePredictions(
          {
            input: value,
            componentRestrictions: { country: 'us' },
            types: ['address'],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSuggestions(
                predictions.map((p) => ({
                  place_id: p.place_id,
                  description: p.description,
                })),
              );
            } else {
              setSuggestions([]);
            }
          },
        );
      }, 300);
    },
    [apiReady],
  );

  // ── Select a suggestion ────────────────────────────────────────────────
  const handleSelectSuggestion = useCallback(
    (suggestion: SuggestionItem) => {
      setSuggestions([]);
      setInputValue(suggestion.description);

      if (!apiReady || !placesService.current) {
        const data: AddressData = {
          place_id: suggestion.place_id,
          formatted_address: suggestion.description,
          street_number: '123',
          route: 'Main St',
          locality: 'Smithtown',
          postal_code: '11787',
          country: 'US',
          unit_number: '',
          lat: 40.8557,
          lng: -73.2026,
          address_quality_score: 95,
        };
        const score = computeScore(data);
        data.address_quality_score = score;
        setAddressData(data);
        setQualityScore(score);
        return;
      }

      placesService.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: [
            'place_id',
            'formatted_address',
            'address_components',
            'geometry',
          ],
        },
        (place, status) => {
          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !place
          )
            return;

          const getComponent = (type: string) =>
            place.address_components?.find((c) => c.types.includes(type))
              ?.short_name ?? '';

          const data: AddressData = {
            place_id: place.place_id ?? suggestion.place_id,
            formatted_address: place.formatted_address ?? suggestion.description,
            street_number: getComponent('street_number'),
            route: getComponent('route'),
            locality:
              getComponent('locality') ||
              getComponent('sublocality') ||
              getComponent('administrative_area_level_3'),
            postal_code: getComponent('postal_code'),
            country: getComponent('country'),
            unit_number: '',
            lat: place.geometry?.location?.lat() ?? 0,
            lng: place.geometry?.location?.lng() ?? 0,
            address_quality_score: 0,
          };

          const score = computeScore(data);
          data.address_quality_score = score;
          setAddressData(data);
          setQualityScore(score);
        },
      );
    },
    [apiReady],
  );

  // ── Submit handler ─────────────────────────────────────────────────────
  const doNavigate = useCallback(() => {
    if (!addressData) return;
    setLoading(true);
    sessionStorage.setItem(
      'precheck_request',
      JSON.stringify({
        ...addressData,
        unit_number: unitNumber.trim() || addressData.unit_number,
        address_quality_score: qualityScore ?? addressData.address_quality_score,
        confirmed_by_user: (qualityScore ?? 100) < 90,
      }),
    );
    router.push('/home/check/results');
  }, [addressData, unitNumber, qualityScore, router]);

  const handleSubmit = () => {
    if (!addressData || qualityScore === null) return;

    if (qualityScore < 70) {
      setShowBlockModal(true);
      return;
    }
    if (qualityScore < 90) {
      setShowWarnModal(true);
      return;
    }
    doNavigate();
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex justify-center py-10 px-4 sm:px-6">
      <div className="flex w-full max-w-[800px] flex-col gap-8">
        {/* Progress Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a2332]">
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Step 1 of 3
                </p>
                <h3 className="text-lg font-bold text-foreground">Property Info</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                33% Completed
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: '33%' }}
              />
            </div>
            <div className="flex justify-between pt-1 text-xs font-medium text-muted-foreground">
              <span className="font-bold text-primary">Property Info</span>
              <span>Analysis</span>
              <span>Report</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 dark:border-gray-800 dark:bg-[#1a2332]">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
              Property Information
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your property address below to get started with your free assessment.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Address Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground" htmlFor="address">
                Property Address
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="size-5 text-muted-foreground" />
                </div>
                <input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State, ZIP"
                  value={inputValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInputValue(v);
                    setAddressData(null);
                    setQualityScore(null);
                    fetchSuggestions(v);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800/50"
                  autoComplete="off"
                />
                {inputValue && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      setInputValue('');
                      setAddressData(null);
                      setQualityScore(null);
                      setSuggestions([]);
                    }}
                  >
                    <X className="size-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1a2332]">
                    {suggestions.map((s) => (
                      <button
                        key={s.place_id}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-primary/5"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(s)}
                      >
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        {s.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                We use this to verify the county records.
              </p>
            </div>

            {/* Unit number field — shown after address selected */}
            {addressData && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground" htmlFor="unit">
                  Unit / Apt # <span className="ml-1 font-normal text-muted-foreground">(Optional)</span>
                </label>
                <input
                  id="unit"
                  type="text"
                  placeholder="e.g. Apt 2B, Unit 101"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800/50"
                />
              </div>
            )}

            {/* Address quality bar */}
            {qualityScore !== null && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all ${scoreColor(qualityScore)}`}
                      style={{ width: `${qualityScore}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    qualityScore >= 90
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : qualityScore >= 70
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {qualityScore >= 90 ? (
                    <CheckCircle className="size-3" />
                  ) : (
                    <AlertTriangle className="size-3" />
                  )}
                  {scoreLabel(qualityScore)} ({qualityScore}/100)
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-end border-t border-gray-100 pt-6 dark:border-gray-700">
              <button
                onClick={handleSubmit}
                disabled={!addressData || loading}
                className="group flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {loading ? 'Processing…' : 'Check Eligibility'}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 transition-transform group-hover:translate-x-1">
                  <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col items-center justify-center gap-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
            </svg>
            <span>256-bit Secure Encryption</span>
          </div>
          <div className="hidden size-1 rounded-full bg-gray-300 dark:bg-gray-700 sm:block" />
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
            <span>Privacy Guaranteed</span>
          </div>
        </div>
      </div>

      {/* ── Soft Warning Modal (70–89) ─────────────────────────────────── */}
      {showWarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl dark:bg-[#1a2332]">
            <div className="flex items-start justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <AlertTriangle className="size-5 text-yellow-500" />
                Address Partially Matched
              </h3>
              <button onClick={() => setShowWarnModal(false)}>
                <X className="size-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your address matched with a quality score of{' '}
              <strong>{qualityScore}/100</strong>. The eligibility results may be
              less accurate than usual.
            </p>
            <p className="rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
              {addressData?.formatted_address}
            </p>
            <p className="text-sm text-muted-foreground">
              You can still proceed, but we recommend verifying the address is correct.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarnModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowWarnModal(false);
                  doNavigate();
                }}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mandatory Confirmation Modal (<70) — PRD §10 ───────────────── */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl dark:bg-[#1a2332]">
            <div className="flex items-start justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <AlertTriangle className="size-5 text-red-500" />
                Low Quality Address Match
              </h3>
              <button onClick={() => setShowBlockModal(false)}>
                <X className="size-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              We could only partially verify this address (score:{' '}
              <strong>{qualityScore}/100</strong>). The eligibility results may be
              significantly less accurate.
            </p>
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800 dark:bg-red-900/20 dark:text-red-300">
              {addressData?.formatted_address}
            </p>
            <p className="text-sm text-muted-foreground">
              Please verify this is the correct address before continuing. You may
              also try entering a more complete address with street number, city,
              and ZIP code.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  doNavigate();
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirm &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
