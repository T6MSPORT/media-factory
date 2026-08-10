import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import type { SupabaseClient } from '@supabase/supabase-js';

const root = fileURLToPath(new URL('..', import.meta.url));
const { createServer } = await import('vite');
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});
const { loadCloudWorkspace, saveCloudWorkspace } = await server.ssrLoadModule(
  '/src/services/cloudWorkspace.ts',
);
const { starter } = await server.ssrLoadModule('/src/store.ts');

after(() => server.close());

test('cloud workspace loads and normalises the account-owned document', async () => {
  const calls: string[] = [];
  const client = {
    from(table: string) {
      calls.push(`from:${table}`);
      return {
        select(columns: string) {
          calls.push(`select:${columns}`);
          return {
            eq(column: string, value: string) {
              calls.push(`eq:${column}:${value}`);
              return { maybeSingle: async () => ({
                data: {
                  workspace_data: { ...starter, profile: { ...starter.profile, number: '46' } },
                  updated_at: '2026-08-10T12:00:00.000Z',
                },
                error: null,
              }) };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  const workspace = await loadCloudWorkspace('driver-46', client);
  assert.equal(workspace?.data.profile.number, '46');
  assert.equal(workspace?.updatedAt, '2026-08-10T12:00:00.000Z');
  assert.deepEqual(calls, [
    'from:user_workspaces',
    'select:workspace_data, updated_at',
    'eq:user_id:driver-46',
  ]);
});

test('cloud workspace upserts the full shared data contract for one account', async () => {
  let saved: Record<string, unknown> | undefined;
  let conflict = '';
  const client = {
    from(table: string) {
      assert.equal(table, 'user_workspaces');
      return {
        async upsert(value: Record<string, unknown>, options: { onConflict: string }) {
          saved = value;
          conflict = options.onConflict;
          return { error: null };
        },
      };
    },
  } as unknown as SupabaseClient;

  await saveCloudWorkspace('driver-46', starter, client);
  assert.equal(conflict, 'user_id');
  assert.equal(saved?.user_id, 'driver-46');
  assert.equal(saved?.workspace_data, starter);
  assert.equal(saved?.schema_version, 1);
  assert.equal(typeof saved?.updated_at, 'string');
});

test('workspace migration enforces per-user read and write ownership', () => {
  const migration = readFileSync(
    fileURLToPath(new URL(
      '../supabase/migrations/202608100001_central_user_workspaces.sql',
      import.meta.url,
    )),
    'utf8',
  );

  assert.match(migration, /workspace_data jsonb not null/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /for select to authenticated/);
  assert.match(migration, /for insert to authenticated/);
  assert.match(migration, /for update to authenticated/);
  assert.equal((migration.match(/auth\.uid\(\)\) = user_id/g) || []).length, 4);
});
