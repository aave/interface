module.exports = {
  // Stop config cascading at the repo root — without this, linting inside a
  // nested checkout (e.g. a git worktree under .claude/worktrees/) merges the
  // outer checkout's config and ESLint aborts on the twice-resolved prettier
  // plugin.
  root: true,
  extends: [
    'next/core-web-vitals',
    'prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['prettier', 'import', 'simple-import-sort', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'prettier/prettier': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'warn',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'import/no-unresolved': 'warn',
    // disabled as with the static export Image does not make to much sense
    '@next/next/no-img-element': 'off',
    'react/self-closing-comp': 'warn',
    'react/display-name': 'off',
  },
};
