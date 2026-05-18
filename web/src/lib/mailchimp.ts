/**
 * Mailchimp helpers shared across endpoints.
 *
 * Pattern: PUT-upsert subscriber, then POST tag. Mailchimp keeps tags out of
 * the member-upsert body so they're a separate call. Tag names match the
 * Customer Journey triggers exactly — see Docs/MAILCHIMP_BUILD_SPEC.md.
 *
 * Env vars (Next.js):
 *   MAILCHIMP_API_KEY  - format 'xxxxxxxx-us8'. Datacenter is auto-parsed.
 *   MAILCHIMP_LIST_ID  - audience ID, e.g. '8bcbe7b0d1'
 */

import crypto from 'node:crypto';

export type MailchimpResult = { ok: true } | { ok: false; error: string };

type Config =
  | { ok: false; error: string }
  | { ok: true; apiKey: string; listId: string; baseUrl: string; headers: Record<string, string> };

function getConfig(): Config {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) {
    return { ok: false, error: 'Mailchimp not configured (missing API key or list ID)' };
  }
  const dc = apiKey.split('-').pop();
  if (!dc || dc === apiKey) {
    return { ok: false, error: 'Mailchimp API key malformed (missing datacenter suffix)' };
  }
  return {
    ok: true,
    apiKey,
    listId,
    baseUrl: `https://${dc}.api.mailchimp.com/3.0`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from('any:' + apiKey).toString('base64'),
    },
  };
}

function subscriberHash(email: string): string {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

/**
 * Upsert a subscriber (PUT — creates if missing, updates if exists).
 * Does NOT attach tags. Use addTag() for that.
 */
export async function upsertSubscriber(
  email: string,
  firstName?: string,
): Promise<MailchimpResult> {
  const cfg = getConfig();
  if (!cfg.ok) return { ok: false, error: cfg.error };

  try {
    const res = await fetch(`${cfg.baseUrl}/lists/${cfg.listId}/members/${subscriberHash(email)}`, {
      method: 'PUT',
      headers: cfg.headers,
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        merge_fields: firstName ? { FNAME: firstName } : {},
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Mailchimp upsert ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: `Mailchimp upsert fetch failed: ${err?.message}` };
  }
}

/**
 * Attach a tag to a subscriber. Tag name must match exactly.
 * Subscriber must already exist (call upsertSubscriber first).
 */
export async function addTag(email: string, tag: string): Promise<MailchimpResult> {
  const cfg = getConfig();
  if (!cfg.ok) return { ok: false, error: cfg.error };

  try {
    const res = await fetch(`${cfg.baseUrl}/lists/${cfg.listId}/members/${subscriberHash(email)}/tags`, {
      method: 'POST',
      headers: cfg.headers,
      body: JSON.stringify({
        tags: [{ name: tag, status: 'active' }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Mailchimp tag attach ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: `Mailchimp tag fetch failed: ${err?.message}` };
  }
}

/**
 * Remove a tag from a subscriber (e.g. on subscription cancellation).
 */
export async function removeTag(email: string, tag: string): Promise<MailchimpResult> {
  const cfg = getConfig();
  if (!cfg.ok) return { ok: false, error: cfg.error };

  try {
    const res = await fetch(`${cfg.baseUrl}/lists/${cfg.listId}/members/${subscriberHash(email)}/tags`, {
      method: 'POST',
      headers: cfg.headers,
      body: JSON.stringify({
        tags: [{ name: tag, status: 'inactive' }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Mailchimp tag remove ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: `Mailchimp tag remove fetch failed: ${err?.message}` };
  }
}

/**
 * Convenience: upsert subscriber AND attach tag. Used by all post-signup flows.
 * Logs (not throws) if tag attach fails after successful upsert.
 */
export async function subscribeAndTag(
  email: string,
  tag: string,
  firstName?: string,
): Promise<MailchimpResult> {
  const upsert = await upsertSubscriber(email, firstName);
  if (!upsert.ok) return upsert;
  const tagResult = await addTag(email, tag);
  if (!tagResult.ok) {
    console.warn(`[mailchimp] subscribeAndTag: upsert ok but tag failed for ${email}: ${tagResult.error}`);
  }
  return { ok: true };
}
