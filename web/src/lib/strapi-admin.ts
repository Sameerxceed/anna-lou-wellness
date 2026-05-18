/**
 * Strapi admin operations using the long-lived admin API token.
 *
 * Used by the Stripe webhook to create/update users and assign the
 * 'reset-room-member' role on successful subscription.
 *
 * Env var:
 *   STRAPI_ADMIN_API_TOKEN - full-access token (Strapi admin -> Settings -> API Tokens)
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const ADMIN_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;

function authHeaders() {
  if (!ADMIN_TOKEN) {
    throw new Error('STRAPI_ADMIN_API_TOKEN not set — cannot perform admin operations');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };
}

export type StrapiUser = {
  id: number;
  email: string;
  username: string;
  confirmed: boolean;
  blocked: boolean;
  role?: { id: number; name: string; type: string };
};

export type StrapiRole = {
  id: number;
  name: string;
  type: string;
};

/**
 * Find a user by email. Returns null if not found.
 */
export async function findUserByEmail(email: string): Promise<StrapiUser | null> {
  const url = new URL(`${STRAPI_URL}/api/users`);
  url.searchParams.set('filters[email][$eq]', email.toLowerCase());
  url.searchParams.set('populate', 'role');

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`findUserByEmail ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as StrapiUser[];
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

/**
 * Find a role by its `type` slug (e.g. 'reset-room-member', 'authenticated').
 */
export async function findRoleByType(type: string): Promise<StrapiRole | null> {
  const res = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`findRoleByType ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { roles: StrapiRole[] };
  return data.roles.find((r) => r.type === type) || null;
}

/**
 * Create a new user with the given role. Returns the created user.
 * Password is randomized; caller should trigger a password-reset email
 * so the user can set their own.
 */
export async function createUser(args: {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
}): Promise<StrapiUser> {
  // Random 32-char password — user resets via email.
  const password = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const res = await fetch(`${STRAPI_URL}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      email: args.email.toLowerCase(),
      username: args.username,
      password,
      confirmed: true,
      blocked: false,
      role: args.roleId,
      firstName: args.firstName,
      lastName: args.lastName,
    }),
  });
  if (!res.ok) throw new Error(`createUser ${res.status}: ${await res.text()}`);
  return (await res.json()) as StrapiUser;
}

/**
 * Update an existing user's role (e.g. promote to reset-room-member).
 */
export async function updateUserRole(userId: number, roleId: number): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ role: roleId }),
  });
  if (!res.ok) throw new Error(`updateUserRole ${res.status}: ${await res.text()}`);
}

/**
 * Trigger a password-reset email so a newly-created user can set their own password.
 * Uses the public users-permissions endpoint (not the admin token).
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });
  if (!res.ok) {
    // Don't throw — email send is best-effort. Log and continue.
    console.warn(`[strapi-admin] sendPasswordReset ${res.status}: ${await res.text()}`);
  }
}

/**
 * High-level: ensure user exists with reset-room-member role.
 *  - If user not found: create them with reset-room-member role + send password reset
 *  - If user found and already member: no-op
 *  - If user found with different role: promote to reset-room-member
 *
 * Idempotent — safe to call from Stripe webhook (which can retry).
 */
export async function grantResetRoomMembership(args: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ created: boolean; userId: number }> {
  const role = await findRoleByType('reset-room-member');
  if (!role) {
    throw new Error('Role "reset-room-member" not found in Strapi — run permissions seed first');
  }

  const existing = await findUserByEmail(args.email);
  if (existing) {
    if (existing.role?.type !== 'reset-room-member') {
      await updateUserRole(existing.id, role.id);
    }
    return { created: false, userId: existing.id };
  }

  const username = args.email.split('@')[0] + '-' + Math.random().toString(36).slice(2, 8);
  const created = await createUser({
    email: args.email,
    username,
    firstName: args.firstName,
    lastName: args.lastName,
    roleId: role.id,
  });
  await sendPasswordReset(args.email);
  return { created: true, userId: created.id };
}

/**
 * Demote a user from reset-room-member back to the default 'authenticated' role.
 * Called on subscription cancellation.
 */
export async function revokeResetRoomMembership(email: string): Promise<void> {
  const authenticatedRole = await findRoleByType('authenticated');
  if (!authenticatedRole) throw new Error('Role "authenticated" not found in Strapi');

  const user = await findUserByEmail(email);
  if (!user) return; // nothing to revoke
  if (user.role?.type !== 'reset-room-member') return; // already not a member

  await updateUserRole(user.id, authenticatedRole.id);
}
