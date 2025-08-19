export default {
  test: {
    environment: 'node',
    globals: true,
    match: ['**/*.test.js'],
    setupFiles: ['__tests__/config/setup.js'],
  },
};
