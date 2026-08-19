import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function source(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

const migration = source('supabase/migrations/020_close_anonymous_lead_inserts.sql');

test('migration 020 keeps RLS enabled and removes anon/authenticated insert authority', () => {
  for (const table of ['contact_submissions', 'inquiries', 'viewing_requests']) {
    assert.match(
      migration,
      new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, 'i')
    );
    assert.match(
      migration,
      new RegExp(
        `REVOKE INSERT ON TABLE public\\.${table} FROM PUBLIC, anon, authenticated`,
        'i'
      )
    );
    assert.match(
      migration,
      new RegExp(`GRANT INSERT ON TABLE public\\.${table} TO service_role`, 'i')
    );
  }

  for (const policy of [
    'Anyone can submit valid contact forms',
    'Anyone can submit contact forms',
    'Anyone can submit valid inquiries',
    'Anyone can submit inquiries',
    'Anyone can submit valid viewing requests',
    'Anyone can submit viewing requests',
  ]) {
    assert.match(migration, new RegExp(`DROP POLICY IF EXISTS "${policy}"`, 'i'));
  }
});

test('migration preserves admin read/update and assigned-agent policy architecture', () => {
  assert.match(migration, /CREATE POLICY "Admins can view contact submissions"[\s\S]*FOR SELECT/i);
  assert.match(migration, /CREATE POLICY "Admins can update contact submissions"[\s\S]*FOR UPDATE/i);
  assert.match(migration, /CREATE POLICY "Admins can update viewing requests"[\s\S]*FOR UPDATE/i);
  assert.doesNotMatch(migration, /DROP POLICY IF EXISTS "Agents can view assigned inquiries"/i);
  assert.doesNotMatch(migration, /DROP POLICY IF EXISTS "Agents can view assigned viewing requests"/i);
  assert.doesNotMatch(migration, /DROP POLICY IF EXISTS "Admins can manage inquiries"/i);
});

test('insert-only database triggers retain defensive lead invariants', () => {
  for (const trigger of [
    'enforce_contact_submission_insert',
    'enforce_inquiry_insert',
    'enforce_viewing_request_insert',
  ]) {
    assert.match(
      migration,
      new RegExp(`BEFORE INSERT[\\s\\S]*${trigger}|${trigger}[\\s\\S]*BEFORE INSERT`, 'i')
    );
    assert.match(
      migration,
      new RegExp(`REVOKE EXECUTE ON FUNCTION public\\.${trigger}\\(\\)`, 'i')
    );
  }

  assert.match(migration, /properties\.status IN \('published', 'featured'\)/i);
  assert.match(migration, /NEW\.assigned_agent_id IS NOT NULL/i);
  assert.match(migration, /NEW\.agent_id IS NOT NULL/i);
  assert.match(migration, /NEW\.notes IS NOT NULL/i);
});

test('migration is non-destructive for existing lead records', () => {
  assert.doesNotMatch(migration, /\bTRUNCATE\b/i);
  assert.doesNotMatch(migration, /\bDROP\s+TABLE\b/i);
  assert.doesNotMatch(migration, /\bDELETE\s+FROM\b/i);
  assert.doesNotMatch(migration, /\bUPDATE\s+public\.(contact_submissions|inquiries|viewing_requests)\b/i);
});

test('all public form routes preserve rate limit and Turnstile before trusted writes', () => {
  const routes = [
    ['app/api/contact/route.ts', 'submitContactSubmission', 'contact_submissions'],
    ['app/api/inquiries/route.ts', 'submitInquiry', 'inquiries'],
    ['app/api/viewing-requests/route.ts', 'submitViewingRequest', 'viewing_requests'],
  ];

  for (const [path, writer, table] of routes) {
    const route = source(path);
    const rateLimitIndex = route.indexOf('await rateLimitPublicForm(');
    const turnstileIndex = route.indexOf('await verifyTurnstileToken(');
    const trustedWriteIndex = route.indexOf(`await ${writer}(`);

    assert.ok(rateLimitIndex >= 0, `${path}: rate limiter remains mandatory`);
    assert.ok(turnstileIndex > rateLimitIndex, `${path}: Turnstile remains mandatory`);
    assert.ok(trustedWriteIndex > turnstileIndex, `${path}: trusted write occurs after Turnstile`);
    assert.equal(route.includes(`.from('${table}').insert`), false, `${path}: no anon insert`);
  }
});

test('trusted writer is server-only, isolated, and never exposes its secret', () => {
  const writer = source('lib/supabase/lead-writer.ts');
  assert.match(writer, /^import 'server-only';/);
  assert.match(writer, /process\.env\.SUPABASE_SECRET_KEY/);
  assert.match(writer, /persistSession: false/);
  assert.doesNotMatch(writer, /NEXT_PUBLIC_SUPABASE_SECRET/i);
  assert.doesNotMatch(writer, /console\.(?:log|error|warn)\([^\n]*supabaseSecretKey/i);

  for (const directory of ['app', 'components', 'hooks']) {
    const combined = sourceTree(directory);
    assert.equal(combined.includes('SUPABASE_SECRET_KEY'), false, `${directory}: no secret access`);
  }

  const envExample = source('.env.example');
  assert.match(envExample, /^SUPABASE_SECRET_KEY=$/m);
  assert.doesNotMatch(envExample, /^SUPABASE_SECRET_KEY=.+$/m);
});

test('Wrangler requires the lead-writer key as a Worker secret', () => {
  const config = JSON.parse(source('wrangler.jsonc'));
  assert.ok(config.secrets.required.includes('SUPABASE_SECRET_KEY'));
  assert.ok(config.secrets.required.includes('TURNSTILE_SECRET_KEY'));
  assert.equal(JSON.stringify(config).includes('sb_secret_'), false);
});

function sourceTree(relativeDirectory) {
  const directory = join(root, relativeDirectory);
  return readdirSync(directory)
    .map((entry) => {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        return sourceTree(join(relativeDirectory, entry));
      }
      return /\.(?:ts|tsx|js|jsx|mjs)$/.test(entry) ? readFileSync(path, 'utf8') : '';
    })
    .join('\n');
}
