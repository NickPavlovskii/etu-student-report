import type { StorybookConfig } from '@storybook/vue3-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  features: {
    sidebarOnboardingChecklist: false,
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
    defaultName: 'Документация',
  },
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: {
        plugin: 'vue-component-meta',
        tsconfig: 'tsconfig.app.json',
      },
    },
  },
  async viteFinal(userConfig) {
    return mergeConfig(userConfig, {
      resolve: {
        alias: {
          '@': path.resolve(dirname, '../src'),
        },
        dedupe: ['vue', 'react', 'react-dom', '@mdx-js/react'],
      },
      optimizeDeps: {
        include: ['react', 'react-dom', '@mdx-js/react'],
      },
      server: {
        watch: {
          ignored: ['**/storybook-static/**'],
        },
      },
    });
  },
};

export default config;
