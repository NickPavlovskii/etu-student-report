import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { ru } from 'vuetify/locale';
import ElementPlus from 'element-plus';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import 'element-plus/dist/index.css';
import '../src/scss/main.scss';
import './tokens.css';
import './preview-body.css';
import './storybook.css';

import { etuBrand, etuTheme } from './brand-theme';

setup((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: { defaultSet: 'mdi' },
    locale: {
      locale: 'ru',
      fallback: 'en',
      messages: { ru },
    },
    theme: {
      defaultTheme: 'etuLight',
      themes: {
        etuLight: {
          dark: false,
          colors: {
            primary: etuBrand.blue,
            secondary: etuBrand.gold,
            surface: etuBrand.surface,
            background: etuBrand.bgApp,
            error: '#dc2626',
            info: etuBrand.blue,
            success: '#16a34a',
            warning: '#d97706',
          },
        },
      },
    },
  });
  app.use(vuetify);
  app.use(ElementPlus);
});

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
      },
    },
    docs: {
      toc: {
        headingSelector: 'h2, h3',
        title: 'На этой странице',
      },
      theme: etuTheme,
    },
    options: {
      storySort: {
        order: [
          'Документация',
          [
            'Введение',
            'Быстрый старт',
            'Каталог компонентов',
            'CSS-переменные (:root)',
            'Токены компонентов',
            '*',
          ],
          'Глобальные компоненты',
          '*',
        ],
      },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: etuBrand.bgApp },
        { name: 'page', value: etuBrand.bgPage },
        { name: 'white', value: etuBrand.surface },
        { name: 'navy', value: etuBrand.navy },
        { name: 'dark', value: etuBrand.text },
      ],
    },
  },
};

export default preview;
