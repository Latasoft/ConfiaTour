import '@testing-library/jest-dom'

// Mock de variables de entorno para tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123'
process.env.CLERK_SECRET_KEY = 'sk_test_123'
process.env.GMAIL_USER = 'test@confiatour.cl'
process.env.GMAIL_APP_PASSWORD = 'test-gmail-password'
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_ADMIN_EMAILS = 'admin@confiatour.cl'

// Mock de Supabase client
jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      update: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      eq: jest.fn(function() { return this }),
      single: jest.fn(function() { return this }),
    }))
  }
}))

