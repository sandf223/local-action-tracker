type JsonRecord = Record<string, unknown>;

const TASK3_PATH = '/rest/v1/contexts/users.admin.models.task_3/functions/tst';

let cachedToken: string | null = null;

function getConfig() {
  const base = process.env.EXTERNAL_API_BASE?.replace(/\/$/, '');
  const username = process.env.EXTERNAL_API_USERNAME;
  const password = process.env.EXTERNAL_API_PASSWORD;

  if (!base || !username || !password) {
    throw new Error(
      'EXTERNAL_API_BASE, EXTERNAL_API_USERNAME and EXTERNAL_API_PASSWORD must be set'
    );
  }

  return { base, username, password };
}

function pickTokenFromUnknown(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) return null;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value !== 'object') return null;

  const obj = value as JsonRecord;
  const keys = ['token', 'access_token', 'id_token', 'jwt', 'accessToken'];
  for (const key of keys) {
    const found = obj[key];
    if (typeof found === 'string' && found.trim()) return found.trim();
  }

  if (obj.data != null) {
    const nested = pickTokenFromUnknown(obj.data, depth + 1);
    if (nested) return nested;
  }

  return null;
}

function tokenFromHeaders(headers: Headers): string | null {
  const auth = headers.get('authorization') || headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || auth.trim();
}

async function login(): Promise<string> {
  const { base, username, password } = getConfig();
  const res = await fetch(`${base}/rest/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  });

  const rawText = await res.text();
  let parsed: unknown = null;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }
  }

  const token =
    pickTokenFromUnknown(parsed) ||
    tokenFromHeaders(res.headers) ||
    (typeof parsed === 'string' ? parsed : null);

  if (!res.ok || !token) {
    throw new Error(
      `Auth failed (${res.status}): ${rawText.slice(0, 300) || res.statusText}`
    );
  }

  cachedToken = token;
  return token;
}

async function getToken(force = false): Promise<string> {
  if (!force && cachedToken) return cachedToken;
  return login();
}

function unwrapRows(payload: unknown): JsonRecord[] {
  if (payload == null) return [];

  const candidates: unknown[] = [payload];
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    const obj = payload as JsonRecord;
    for (const key of ['data', 'rows', 'result', 'items', 'records']) {
      if (obj[key] != null) candidates.push(obj[key]);
    }
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((row, index) => {
        if (row != null && typeof row === 'object' && !Array.isArray(row)) {
          return row as JsonRecord;
        }
        return { value: row, index };
      });
    }
  }

  if (typeof payload === 'object' && !Array.isArray(payload)) {
    return [payload as JsonRecord];
  }

  return [{ value: payload }];
}

async function callTask3(token: string): Promise<Response> {
  const { base } = getConfig();
  return fetch(`${base}${TASK3_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify([{}]),
    cache: 'no-store',
  });
}

export async function fetchTask3Rows(): Promise<JsonRecord[]> {
  let token = await getToken();
  let res = await callTask3(token);

  if (res.status === 401) {
    cachedToken = null;
    token = await getToken(true);
    res = await callTask3(token);
  }

  const rawText = await res.text();
  let parsed: unknown = null;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error(`Task3 returned non-JSON (${res.status}): ${rawText.slice(0, 300)}`);
    }
  }

  if (!res.ok) {
    throw new Error(
      `Task3 request failed (${res.status}): ${rawText.slice(0, 300) || res.statusText}`
    );
  }

  return unwrapRows(parsed);
}
