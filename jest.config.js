module.exports = {
  preset: 'jest-expo',
  collectCoverageFrom: ['lib/**/*.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};