import 'server-only';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';

export interface DBFilter {
  type: string;
  args: any[];
}

export interface DBProxyPayload {
  table: string;
  action: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  selectQuery?: string;
  filters?: DBFilter[];
  data?: any;
  single?: boolean;
  maybeSingle?: boolean;
}

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('x-internal-api-secret', INTERNAL_API_SECRET);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = { error: errText };
    }
    throw new Error(parsedErr.error || parsedErr.message || 'Request failed');
  }

  return response.json();
}

export async function queryBackendDb(payload: DBProxyPayload) {
  const result = await fetchFromBackend('/api/admin/db', {
    method: 'POST',
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  return result.data;
}
