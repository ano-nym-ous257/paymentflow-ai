import { describe, expect, it } from 'vitest';
import { mapProfileRow } from './mapper';

describe('mapProfileRow', () => {
  it('maps a database profile row to the application profile model', () => {
    expect(
      mapProfileRow({
        id: 'user-1',
        display_name: 'PaymentFlow Owner',
        avatar_url: null,
        status: 'active',
        created_at: '2026-08-14T00:00:00.000Z',
        updated_at: '2026-08-15T00:00:00.000Z',
      }),
    ).toEqual({
      id: 'user-1',
      displayName: 'PaymentFlow Owner',
      avatarUrl: null,
      status: 'active',
      createdAt: '2026-08-14T00:00:00.000Z',
      updatedAt: '2026-08-15T00:00:00.000Z',
    });
  });

  it('rejects unknown status values instead of manufacturing application state', () => {
    expect(() =>
      mapProfileRow({
        id: 'user-1',
        display_name: '',
        avatar_url: null,
        status: 'admin',
        created_at: '',
        updated_at: '',
      }),
    ).toThrow('Profile data is invalid.');
  });
});
