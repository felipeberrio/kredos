import '@testing-library/jest-dom';

vi.mock('../supabaseClient', () => {
  const mockChain = (resolveValue = { data: [], error: null }) => {
    const chain = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(resolveValue)),
      maybeSingle: vi.fn(() => Promise.resolve(resolveValue)),
    };
    chain.then = vi.fn((cb) => Promise.resolve(resolveValue).then(cb));
    return chain;
  };
  return {
    supabase: {
      from: vi.fn((table) => {
        const defaultData = table === 'profiles'
          ? { data: null, error: null }
          : { data: [], error: null };
        return mockChain(defaultData);
      }),
      auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' },
            },
          },
        },
        error: null,
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
  };
});
