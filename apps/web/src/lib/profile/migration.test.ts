import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(__dirname, '../../../../../supabase/migrations/20260816000100_create_profiles.sql'),
  'utf8',
).toLowerCase();

describe('profiles migration security properties', () => {
  it('enables and forces RLS while limiting reads to the authenticated user profile', () => {
    expect(migration).toMatch(
      /alter\s+table\s+public\.profiles\s+enable\s+row\s+level\s+security\s*;/,
    );
    expect(migration).toMatch(
      /alter\s+table\s+public\.profiles\s+force\s+row\s+level\s+security\s*;/,
    );
    expect(migration).toContain('create policy "profiles_select_own"');
    expect(migration).toContain('auth.uid()');
  });

  it('does not grant authenticated clients insert or delete access', () => {
    expect(migration).toMatch(
      /revoke\s+all\s+on\s+table\s+public\.profiles\s+from\s+anon\s*,\s*authenticated\s*;/,
    );
    expect(migration).not.toMatch(/grant\s+insert\s+on\s+(?:table\s+)?public\.profiles/);
    expect(migration).not.toMatch(/grant\s+delete\s+on\s+(?:table\s+)?public\.profiles/);
    expect(migration).not.toMatch(/on\s+public\.profiles\s+for\s+insert\b/);
    expect(migration).not.toMatch(/on\s+public\.profiles\s+for\s+delete\b/);
  });

  it('keeps internal trigger functions unavailable as application RPCs', () => {
    for (const functionName of ['set_updated_at', 'provision_user_profile']) {
      expect(migration).toMatch(
        new RegExp(
          `revoke\\s+execute\\s+on\\s+function\\s+public\\.${functionName}\\s*\\(\\s*\\)\\s+from\\s+public\\s*;`,
        ),
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+execute\\s+on\\s+function\\s+public\\.${functionName}\\s*\\(\\s*\\)\\s+to\\s+(?:anon|authenticated)\\s*;`,
        ),
      );
    }
  });

  it('provisions and backfills profiles idempotently using hardened functions', () => {
    expect(migration).toContain('create function public.provision_user_profile()');
    expect(migration).toContain('create trigger auth_user_profile_provisioning');
    expect(migration).toContain('from auth.users as users');
    expect(migration.match(/on conflict \(id\) do nothing/g)).toHaveLength(2);
    expect(migration).toContain('security definer');
    expect(migration).toMatch(/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/);
  });

  it('uses a conservative non-cascading authentication-subject relationship', () => {
    expect(migration).toContain('references auth.users (id) on delete restrict');
  });
});
