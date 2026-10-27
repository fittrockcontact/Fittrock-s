/**
 * Fittrock Sales Dashboard API Client
 * Connects directly and exclusively to the backend REST API.
 * ZERO direct database or Supabase credentials in this frontend workspace.
 */

import { auth } from '@/lib/firebase/config';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Every sales endpoint requires the signed-in rep's Firebase ID token.
  const token = await auth.currentUser?.getIdToken();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    cache: options.cache || 'no-store',
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
