import { addons } from 'storybook/manager-api';

import { etuTheme } from './brand-theme';
import { mountSidebarBrand } from './manager-brand';

import './manager.css';

addons.setConfig({
  theme: etuTheme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
  navSize: 300,
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});

mountSidebarBrand();
