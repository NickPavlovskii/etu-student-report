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
import './preview-body.css';

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
  });
  app.use(vuetify);
  app.use(ElementPlus);
});

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: [
          'Документация/Введение',
          'Документация/Быстрый старт',
          'Документация/Каталог компонентов',
          'Документация/CSS-переменные (:root)',
          'Документация/Токены компонентов',
          'Глобальные компоненты/*',
        ],
      },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#f4f6f9' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
