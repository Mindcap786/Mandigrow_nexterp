// Frappe API client.
//
// Design:
// - Browser requests go through Next.js rewrite (/api/method/* →
//   http://mandigrow.localhost:8000) so everything is same-origin. Cookies
//   Just Work; no CORS. Capacitor/native builds can set
//   NEXT_PUBLIC_FRAPPE_URL to point at a public Frappe host.
// - callApi() always returns the unwrapped `message` payload from Frappe
//   (Frappe wraps everything in {"message": ...}).
// - Errors are normalized into FrappeError with the fields the UI actually
//   uses: message, exc_type, server_messages (parsed), status.
// - 401/403 does NOT auto-redirect here; the auth provider handles that to
//   avoid redirect loops during hydration.

const FRAPPE_BASE = (() => {
    if (typeof window !== 'undefined') {
        // Capacitor ships with a file:// origin — must hit absolute URL.
        const capacitor = (process.env.NEXT_PUBLIC_CAPACITOR === 'true');
        if (capacitor) return process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';
        return ''; // same-origin via Next rewrite
    }
    return process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';
})();

export class FrappeError extends Error {
    exc_type?: string;
    server_messages: string[];
    status: number;
    raw?: any;

    constructor(msg: string, opts: { exc_type?: string; server_messages?: string[]; status?: number; raw?: any } = {}) {
        super(msg);
        this.name = 'FrappeError';
        this.exc_type = opts.exc_type;
        this.server_messages = opts.server_messages || [];
        this.status = opts.status ?? 0;
        this.raw = opts.raw;
    }
}

function parseServerMessages(raw: any): string[] {
    const src = raw?._server_messages;
    if (!src) return [];
    try {
        const outer = typeof src === 'string' ? JSON.parse(src) : src;
        const arr = Array.isArray(outer) ? outer : [outer];
        return arr.map((s: any) => {
            try {
                const inner = typeof s === 'string' ? JSON.parse(s) : s;
                return inner?.message || String(s);
            } catch {
                return String(s);
            }
        });
    } catch {
        return [];
    }
}

function readCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${FRAPPE_BASE}${path}`;
    const headers = new Headers(init.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('X-Frappe-Site-Name', 'mandigrow.localhost');

    const csrf = readCookie('csrf_token');
    if (csrf && init.method && init.method !== 'GET') {
        headers.set('X-Frappe-CSRF-Token', csrf);
    }

    let res: Response;
    try {
        res = await fetch(url, {
            ...init,
            headers,
            credentials: 'include',
        });
    } catch (e: any) {
        throw new FrappeError(e?.message || 'Network error', { status: 0 });
    }

    const text = await res.text();
    let json: any = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        json = { raw: text };
    }

    if (!res.ok) {
        const msgs = parseServerMessages(json);
        const message = msgs[0] || json?.message || json?.exception || `HTTP ${res.status} ${res.statusText}`;
        throw new FrappeError(message, {
            exc_type: json?.exc_type,
            server_messages: msgs,
            status: res.status,
            raw: json,
        });
    }

    return json as T;
}

/**
 * Call a whitelisted Frappe method. Returns the unwrapped `message` payload.
 * @example
 *   const contact = await callApi('mandigrow.api.create_contact', { name, contact_type, phone })
 */
export async function callApi<T = any>(method: string, args?: Record<string, any>): Promise<T> {
    const body = args ? JSON.stringify(args) : undefined;
    const res = await request<{ message: T }>(`/api/method/${method}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body,
    });
    return res?.message as T;
}

/** GET variant for idempotent / browser-cacheable reads. */
export async function callApiGet<T = any>(
    method: string,
    args?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
    const qs = args
        ? '?' +
          Object.entries(args)
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
              .join('&')
        : '';
    const res = await request<{ message: T }>(`/api/method/${method}${qs}`, { method: 'GET' });
    return res?.message as T;
}

export async function login(usr: string, pwd: string): Promise<{ full_name: string; home_page: string }> {
    const body = new URLSearchParams({ usr, pwd }).toString();
    return request('/api/method/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
}

export async function logout(): Promise<void> {
    await request('/api/method/logout', { method: 'POST' });
}

/**
 * Generic DocType CRUD helpers. Prefer whitelisted mandigrow.api.* methods
 * for business logic; these are only for simple reads on fully-trusted DocTypes.
 */
export const db = {
    async getDoc<T = any>(doctype: string, name: string): Promise<T> {
        return callApi<T>('frappe.client.get', { doctype, name });
    },
    async getList<T = any>(
        doctype: string,
        opts: { filters?: any; fields?: string[]; order_by?: string; limit?: number; start?: number } = {},
    ): Promise<T[]> {
        return callApi<T[]>('frappe.client.get_list', {
            doctype,
            filters: opts.filters,
            fields: opts.fields,
            order_by: opts.order_by,
            limit_page_length: opts.limit,
            limit_start: opts.start,
        });
    },
    async getValue<T = any>(doctype: string, filters: any, fieldname: string | string[]): Promise<T> {
        return callApi<T>('frappe.client.get_value', { doctype, filters, fieldname });
    },
    async createDoc<T = any>(doctype: string, data: Record<string, any>): Promise<T> {
        const body = JSON.stringify({ ...data, doctype });
        const res = await request<{ data: T }>(`/api/resource/${encodeURIComponent(doctype)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });
        return res?.data as T;
    },
    async deleteDoc(doctype: string, name: string): Promise<void> {
        await request(`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`, {
            method: 'DELETE',
        });
    },
};

// Back-compat: some files import `frappe` as a namespace.
export const frappe = { callApi, callApiGet, login, logout, db };
