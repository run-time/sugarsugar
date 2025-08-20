export default {
  test: {
    environment: 'node',
    globals: true,
    match: ['**/*.test.js'],
    setupFiles: ['__tests__/config/setup.js'],
  },
  coverage: {
    provider: 'c8',
    reportsDirectory: './coverage',
    reporter: ['text', 'html', 'lcov'],
    include: [
      'api/client.js',
      'api/constants.js',
      'api/glucose.js',
      'api/graph.js',
      'api/health.js',
      'api/index.js',
      'api/sugarsugar.js',
    ],
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
};
