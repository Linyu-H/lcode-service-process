export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8765';
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}
export const api = { get: <T>(p: string) => request<T>(p), post: <T>(p: string, b?: unknown) => request<T>(p, { method: 'POST', body: JSON.stringify(b || {}) }), put: <T>(p: string, b?: unknown) => request<T>(p, { method: 'PUT', body: JSON.stringify(b || {}) }), del: <T>(p: string) => request<T>(p, { method: 'DELETE' }) };
