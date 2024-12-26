module.exports = {
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
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars':'off',
    'prettier/prettier': 'warn',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
    'import/first': 'off',
    'import/newline-after-import': 'off',
    'import/no-duplicates': 'off',
    'import/no-named-as-default': 'off',
    'import/no-unresolved': 'off',
    // disabled as with the static export Image does not make to much sense
    '@next/next/no-img-element': 'off',
    'react/self-closing-comp': 'off',
    'react/display-name': 'off',
  },
};
