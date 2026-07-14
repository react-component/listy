module.exports = {
  setupFiles: ['./tests/setup.js'],
  // ponytail: git worktrees under .claude/ are duplicate copies of this package;
  // excluding them from the haste map avoids duplicate-module-name crashes.
  modulePathIgnorePatterns: ['<rootDir>/.claude/'],
  moduleNameMapper: {
    '^@rc-component/listy$': '<rootDir>/src/index.ts',
  },
};
