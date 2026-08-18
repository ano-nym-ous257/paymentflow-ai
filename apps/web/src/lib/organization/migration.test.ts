import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationSource = readFileSync(
  resolve(__dirname, '../../../../../supabase/migrations/20260818000100_create_organizations.sql'),
  'utf8',
);
const migration = migrationSource.toLowerCase();

function tableDefinition(tableName: string): string {
  const match = migration.match(
    new RegExp(`create\\s+table\\s+public\\.${tableName}\\s*\\(([\\s\\S]*?)\\n\\);`),
  );
  if (!match?.[1]) throw new Error(`Missing ${tableName} table definition.`);
  return match[1];
}

function policyDefinition(policyName: string): string {
  const match = migration.match(new RegExp(`create\\s+policy\\s+"${policyName}"([\\s\\S]*?);`));
  if (!match?.[1]) throw new Error(`Missing ${policyName} policy definition.`);
  return match[1];
}

describe('organization migration security properties', () => {
  it('creates the constrained organization schema with database-managed identity and timestamps', () => {
    const table = tableDefinition('organizations');

    expect(table).toMatch(/id\s+uuid\s+primary\s+key\s+default\s+gen_random_uuid\(\)/);
    expect(table).toMatch(/name\s+text\s+not\s+null/);
    expect(table).toMatch(/status\s+text\s+not\s+null\s+default\s+'active'/);
    expect(table).toMatch(/check\s*\(status\s+in\s*\('active',\s*'suspended',\s*'closed'\)\)/);
    expect(table).toMatch(/char_length\(name\)\s+between\s+1\s+and\s+120/);
    expect(table.match(/timestamptz\s+not\s+null\s+default\s+now\(\)/g)).toHaveLength(2);
  });

  it('creates normalized memberships with constrained role, status, and uniqueness', () => {
    const table = tableDefinition('organization_memberships');

    expect(table).toMatch(/check\s*\(role\s+in\s*\('owner',\s*'member'\)\)/);
    expect(table).toMatch(/check\s*\(status\s+in\s*\('active',\s*'suspended'\)\)/);
    expect(table).toMatch(/primary\s+key\s*\(organization_id,\s*user_id\)/);
  });

  it('uses deliberate identity and membership deletion behavior', () => {
    expect(tableDefinition('organizations')).toMatch(
      /references\s+auth\.users\s*\(id\)\s+on\s+delete\s+restrict/,
    );
    const memberships = tableDefinition('organization_memberships');
    expect(memberships).toMatch(
      /references\s+public\.organizations\s*\(id\)\s+on\s+delete\s+cascade/,
    );
    expect(memberships).toMatch(/references\s+auth\.users\s*\(id\)\s+on\s+delete\s+cascade/);
  });

  it.each(['organizations', 'organization_memberships'])(
    'enables and forces RLS on %s',
    (tableName) => {
      expect(migration).toMatch(
        new RegExp(
          `alter\\s+table\\s+public\\.${tableName}\\s+enable\\s+row\\s+level\\s+security\\s*;`,
        ),
      );
      expect(migration).toMatch(
        new RegExp(
          `alter\\s+table\\s+public\\.${tableName}\\s+force\\s+row\\s+level\\s+security\\s*;`,
        ),
      );
    },
  );

  it('grants authenticated clients SELECT only and grants anon no table access', () => {
    for (const tableName of ['organizations', 'organization_memberships']) {
      expect(migration).toMatch(
        new RegExp(
          `revoke\\s+all\\s+on\\s+table\\s+public\\.${tableName}\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`,
        ),
      );
      expect(migration).toMatch(
        new RegExp(
          `grant\\s+select\\s+on\\s+table\\s+public\\.${tableName}\\s+to\\s+authenticated\\s*;`,
        ),
      );
      expect(migration).not.toMatch(
        new RegExp(
          `grant\\s+(?:insert|update|delete|all)\\s+on\\s+(?:table\\s+)?public\\.${tableName}`,
        ),
      );
    }
  });

  it('creates organizations and initial owner memberships atomically from auth.uid()', () => {
    expect(migration).toMatch(
      /create\s+function\s+public\.create_organization\(organization_name\s+text\)/,
    );
    expect(migration).toMatch(/caller_id\s+uuid\s*:=\s*\(select\s+auth\.uid\(\)\)/);
    expect(migration).toMatch(/if\s+caller_id\s+is\s+null\s+then/);
    expect(migration).toMatch(
      /insert\s+into\s+public\.organizations\s*\(name,\s*created_by\)\s*values\s*\(normalized_name,\s*caller_id\)/,
    );
    expect(migration).toMatch(
      /insert\s+into\s+public\.organization_memberships\s*\(organization_id,\s*user_id,\s*role,\s*status\)\s*values\s*\(created_organization\.id,\s*caller_id,\s*'owner',\s*'active'\)/,
    );
  });

  it('hardens internal functions and grants only required authenticated execution', () => {
    for (const { functionName, signature } of [
      {
        functionName: 'is_active_organization_member',
        signature: 'is_active_organization_member\\s*\\(uuid\\)',
      },
      { functionName: 'create_organization', signature: 'create_organization\\s*\\(text\\)' },
    ]) {
      expect(migrationSource).toMatch(
        new RegExp(
          `revoke\\s+execute\\s+on\\s+function\\s+public\\.${signature}\\s+from\\s+PUBLIC\\s*;`,
        ),
      );
      expect(migration).toMatch(
        new RegExp(
          `revoke\\s+execute\\s+on\\s+function\\s+public\\.${signature}\\s+from\\s+anon\\s*;`,
        ),
      );
      expect(migration).toMatch(
        new RegExp(
          `grant\\s+execute\\s+on\\s+function\\s+public\\.${signature}\\s+to\\s+authenticated\\s*;`,
        ),
      );

      const functionDefinition = migration.match(
        new RegExp(`create\\s+function\\s+public\\.${functionName}[\\s\\S]*?\\$\\$;`),
      )?.[0];
      expect(functionDefinition).toMatch(/security\s+definer/);
      expect(functionDefinition).toMatch(/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/);
    }
  });

  it('uses a non-recursive helper for active membership and active organization visibility', () => {
    const helper = migration.match(
      /create\s+function\s+public\.is_active_organization_member[\s\S]*?\$\$;/,
    )?.[0];
    expect(helper).toMatch(/membership\.user_id\s*=\s*\(select\s+auth\.uid\(\)\)/);
    expect(helper).toMatch(/membership\.status\s*=\s*'active'/);
    expect(helper).toMatch(/organization\.status\s*=\s*'active'/);

    for (const policyName of [
      'organizations_select_active_member',
      'organization_memberships_select_active_organization_member',
    ]) {
      const policy = policyDefinition(policyName);
      expect(policy).toContain('public.is_active_organization_member');
      expect(policy).not.toMatch(/from\s+public\.organization_memberships/);
    }
  });

  it('defines no direct insert, update, or delete policies', () => {
    expect(migration).not.toMatch(/for\s+(?:insert|update|delete)\b/);
  });
});
