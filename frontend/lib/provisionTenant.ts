// Frappe-only tenant provisioning orchestrator.
//
// Single source of truth for "create a new Mandi tenant" — both the public
// /signup flow and the admin /admin/tenants → Provision dialog go through
// here so there is exactly one rollback story to debug.
//
// Stages (in order):
//   1. validate           — input shape, password strength
//   2. check_availability — Frappe RPC: is email / username already taken
//   3. create_workspace   — Frappe RPC mandigrow.api.signup_user creates:
//                             • Mandi Organization doctype  (ORG-#####)
//                             • ERPNext Company             (chart-of-accounts root)
//                             • Frappe User                 (linked to ORG-#####)
//   4. ready              — terminal "all done" event
//
// Error model:
//   - Each stage either yields { status: 'complete' } or throws ProvisionError
//     with a short, user-safe message + the stage that failed.
//   - On any failure we ATTEMPT compensating writes (delete Frappe user/org).
//     They are logged but never block the original error reaching the caller.
//
// Streaming contract: emits ProvisionEvent values. The route handler converts
// them to SSE frames; tests can consume the iterator directly.
//
// No Supabase. Single backend (Frappe + MariaDB).

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProvisionStage =
    | 'validate'
    | 'check_availability'
    | 'create_workspace'
    | 'ready';

export type ProvisionEvent =
    | { kind: 'stage'; stage: ProvisionStage; status: 'running' | 'complete'; label: string; progress: number; elapsedMs: number }
    | { kind: 'done';  organizationId: string; userId: string; loginIdentifier: string; redirect: string; elapsedMs: number }
    | { kind: 'error'; stage: ProvisionStage; message: string; code: string; elapsedMs: number };

export interface ProvisionInput {
    orgName: string;
    fullName: string;
    email: string;
    password: string;
    username: string;
    phone?: string;
    plan?: string;
}

export class ProvisionError extends Error {
    stage: ProvisionStage;
    code: string;
    constructor(stage: ProvisionStage, code: string, message: string) {
        super(message);
        this.name = 'ProvisionError';
        this.stage = stage;
        this.code = code;
    }
}

// ---------------------------------------------------------------------------
// Stage metadata — labels and weights live in one place so the UI never
// drifts from the backend.
// ---------------------------------------------------------------------------

const STAGES: { key: ProvisionStage; label: string; progress: number }[] = [
    { key: 'validate',           label: 'Verifying your details',         progress: 15 },
    { key: 'check_availability', label: 'Checking name availability',     progress: 35 },
    { key: 'create_workspace',   label: 'Building your Mandi workspace',  progress: 90 },
    { key: 'ready',              label: 'Workspace ready',                progress: 100 },
];

const stageMeta = (key: ProvisionStage) => STAGES.find(s => s.key === key)!;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FRAPPE_INTERNAL_URL =
    process.env.FRAPPE_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_FRAPPE_URL ||
    'http://localhost:8000';

const FRAPPE_SITE_HEADER =
    process.env.FRAPPE_SITE_NAME || 'mandigrow.localhost';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function validate(input: ProvisionInput) {
    const trimmed = {
        orgName:  input.orgName?.trim()  ?? '',
        fullName: input.fullName?.trim() ?? '',
        email:    input.email?.trim().toLowerCase() ?? '',
        username: input.username?.trim().toLowerCase() ?? '',
        phone:    input.phone?.trim() ?? '',
    };
    if (!trimmed.orgName)  throw new ProvisionError('validate', 'MISSING_ORG_NAME',  'Organisation name is required.');
    if (!trimmed.fullName) throw new ProvisionError('validate', 'MISSING_FULL_NAME', 'Owner full name is required.');
    if (!isValidEmail(trimmed.email))
                            throw new ProvisionError('validate', 'INVALID_EMAIL',    'Enter a valid email address.');
    if (!input.password || input.password.length < 8)
                            throw new ProvisionError('validate', 'WEAK_PASSWORD',    'Password must be at least 8 characters.');
    if (!trimmed.username || trimmed.username.length < 6)
                            throw new ProvisionError('validate', 'INVALID_USERNAME', 'Username must be at least 6 characters.');
    if (!/^[a-z0-9]+$/.test(trimmed.username))
                            throw new ProvisionError('validate', 'INVALID_USERNAME', 'Username can only contain lowercase letters and digits.');
    return { ...input, ...trimmed };
}

async function callFrappe(method: string, payload: Record<string, unknown>): Promise<any> {
    const url = `${FRAPPE_INTERNAL_URL}/api/method/${method}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Frappe-Site-Name': FRAPPE_SITE_HEADER,
        },
        body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    if (!res.ok) {
        const msg =
            json?._server_messages
                ? safeFrappeMessage(json._server_messages)
                : json?.message || json?.exception || `Frappe ${method} failed (${res.status})`;
        const err: any = new Error(msg);
        err.status = res.status;
        err.frappe = json;
        throw err;
    }
    return json?.message ?? json;
}

function safeFrappeMessage(serverMessages: string): string {
    try {
        const outer = JSON.parse(serverMessages);
        const arr = Array.isArray(outer) ? outer : [outer];
        const first = typeof arr[0] === 'string' ? JSON.parse(arr[0]) : arr[0];
        return first?.message || 'Frappe error';
    } catch {
        return 'Frappe error';
    }
}

// ---------------------------------------------------------------------------
// Main orchestrator (async generator)
// ---------------------------------------------------------------------------

export async function* provisionTenantStream(
    rawInput: ProvisionInput
): AsyncGenerator<ProvisionEvent, void, void> {
    const startedAt = Date.now();
    const elapsed = () => Date.now() - startedAt;

    const emit = (
        stage: ProvisionStage,
        status: 'running' | 'complete'
    ): ProvisionEvent => ({
        kind: 'stage',
        stage,
        status,
        label: stageMeta(stage).label,
        progress: status === 'complete' ? stageMeta(stage).progress : Math.max(stageMeta(stage).progress - 10, 0),
        elapsedMs: elapsed(),
    });

    let createdFrappeUser: string | null = null;
    let createdFrappeOrg: string | null = null;

    try {
        // ---- 1. validate ---------------------------------------------------
        yield emit('validate', 'running');
        const input = validate(rawInput);
        yield emit('validate', 'complete');

        // ---- 2. check_availability ----------------------------------------
        // Cheap pre-flight against Frappe so the user sees a fast, specific
        // error instead of a generic "signup_user failed".
        yield emit('check_availability', 'running');
        try {
            const avail = await callFrappe('mandigrow.api.check_unique', {
                email:    input.email,
                username: input.username,
            });
            if (avail?.emailTaken) {
                throw new ProvisionError('check_availability', 'EMAIL_TAKEN',
                    'An account with this email already exists.');
            }
            if (avail?.usernameTaken) {
                throw new ProvisionError('check_availability', 'USERNAME_TAKEN',
                    'That username is taken — please pick another.');
            }
        } catch (e: any) {
            if (e instanceof ProvisionError) throw e;
            // Availability check itself failed — surface but don't block,
            // signup_user will produce the real duplicate error if any.
            console.warn('[provision] check_unique failed (continuing):', e?.message);
        }
        yield emit('check_availability', 'complete');

        // ---- 3. create_workspace ------------------------------------------
        // signup_user creates Mandi Organization + Company + User in
        // one Frappe transaction (see apps/mandigrow/mandigrow/api.py).
        yield emit('create_workspace', 'running');
        let result: { user_id: string; org_id: string };
        try {
            result = await callFrappe('mandigrow.api.signup_user', {
                email:     input.email,
                password:  input.password,
                full_name: input.fullName,
                username:  input.username,
                org_name:  input.orgName,
                phone:     input.phone || '',
            });
            createdFrappeUser = result.user_id;
            createdFrappeOrg  = result.org_id;
        } catch (e: any) {
            const msg = String(e?.message || '');
            if (/already exists/i.test(msg) || /Duplicate/i.test(msg)) {
                throw new ProvisionError('create_workspace', 'EMAIL_TAKEN',
                    'An account with this email already exists.');
            }
            throw new ProvisionError('create_workspace', 'FRAPPE_FAILED',
                msg || 'Could not create your Mandi workspace.');
        }
        yield emit('create_workspace', 'complete');

        // ---- 4. ready -----------------------------------------------------
        yield {
            kind: 'done',
            organizationId:  createdFrappeOrg!,
            userId:          createdFrappeUser!,
            loginIdentifier: input.email,
            redirect:        '/dashboard',
            elapsedMs:       elapsed(),
        };
    } catch (err: any) {
        await rollback({ createdFrappeUser, createdFrappeOrg });

        const e: ProvisionError =
            err instanceof ProvisionError
                ? err
                : new ProvisionError('validate', 'UNEXPECTED', err?.message || 'Unexpected error');

        yield { kind: 'error', stage: e.stage, message: e.message, code: e.code, elapsedMs: elapsed() };
    }
}

// ---------------------------------------------------------------------------
// Convenience wrapper: drain the generator, return the final event. Used by
// tests and by the JSON (non-SSE) compatibility branch on the admin route.
// ---------------------------------------------------------------------------

export async function provisionTenant(input: ProvisionInput): Promise<ProvisionEvent> {
    let last: ProvisionEvent | null = null;
    for await (const evt of provisionTenantStream(input)) {
        if (evt.kind !== 'stage') last = evt;
    }
    if (!last) {
        return { kind: 'error', stage: 'validate', code: 'NO_EVENTS', message: 'Provisioning produced no result.', elapsedMs: 0 };
    }
    return last;
}

// ---------------------------------------------------------------------------
// Rollback
// ---------------------------------------------------------------------------

async function rollback(state: {
    createdFrappeUser: string | null;
    createdFrappeOrg:  string | null;
}) {
    const tasks: Promise<unknown>[] = [];

    if (state.createdFrappeUser) {
        tasks.push(
            callFrappe('frappe.client.delete', { doctype: 'User', name: state.createdFrappeUser })
                .catch(e => console.error('[provision rollback] delete Frappe user failed', e))
        );
    }
    if (state.createdFrappeOrg) {
        tasks.push(
            callFrappe('frappe.client.delete', { doctype: 'Mandi Organization', name: state.createdFrappeOrg })
                .catch(e => console.error('[provision rollback] delete Frappe org failed', e))
        );
    }

    await Promise.allSettled(tasks);
}

// ---------------------------------------------------------------------------
// SSE helper — turn a stream of ProvisionEvent into a Response with the
// correct headers. Centralised here so admin and public routes don't drift.
// ---------------------------------------------------------------------------

export function provisionEventStreamResponse(input: ProvisionInput): Response {
    const encoder = new TextEncoder();

    const body = new ReadableStream({
        async start(controller) {
            const send = (evt: ProvisionEvent) => {
                const frame =
                    `event: ${evt.kind}\n` +
                    `data: ${JSON.stringify(evt)}\n\n`;
                controller.enqueue(encoder.encode(frame));
            };

            // Heartbeat every 5s so proxies don't kill the connection.
            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(`: ping\n\n`));
            }, 5000);

            try {
                for await (const evt of provisionTenantStream(input)) {
                    send(evt);
                }
            } catch (e: any) {
                send({
                    kind: 'error',
                    stage: 'validate',
                    code: 'STREAM_FAILED',
                    message: e?.message || 'Stream failed',
                    elapsedMs: 0,
                });
            } finally {
                clearInterval(heartbeat);
                controller.close();
            }
        },
    });

    return new Response(body, {
        headers: {
            'Content-Type':       'text/event-stream; charset=utf-8',
            'Cache-Control':      'no-cache, no-transform',
            'Connection':         'keep-alive',
            'X-Accel-Buffering':  'no', // disable nginx buffering on Frappe Cloud
        },
    });
}
