// @ts-check
import { defineConfig, js, prettier } from '@bassist/eslint'

export default defineConfig([
  ...prettier,
  ...js,
  {
    rules: {
      'no-console': 'off',
    },
  },
])
