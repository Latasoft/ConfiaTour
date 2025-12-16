const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Tests de API usan 'node', tests de componentes usan 'jsdom'
  testEnvironment: 'jest-environment-node',
  
  // Permite configurar entorno específico por test
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Separar tests unitarios e integración
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  
  // Timeouts para tests con llamadas async
  testTimeout: 10000,
  
  // Mostrar tests individuales
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
