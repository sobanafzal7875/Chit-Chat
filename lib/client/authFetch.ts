/** Browser-only helpers for authenticated API calls. */

export function getBearerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function authHeaders(): HeadersInit {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function jsonAuthHeaders(): HeadersInit {
  return {
    ...authHeaders(),
    'Content-Type': 'application/json',
  };
}
