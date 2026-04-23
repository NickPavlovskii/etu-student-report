export const ETU_BUTTON_PRIMARY_FILLED_STYLE = {
  border: false,
  bgColor: '#1e3a8a',
  color: '#ffffff',
} as const;

/** Data-URI (галочка): `prependIcon` / `appendIcon` в EtuButton — только URL для `<img>`. */
export const ETU_BUTTON_STORY_ICON_CHECK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1e293b" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41L9 16.17z"/></svg>'
  );

export const etuButtonStoryArgs = {
  default: {
    title: 'Сохранить',
    border: true,
  },
  filledPrimary: {
    title: 'Продолжить',
    ...ETU_BUTTON_PRIMARY_FILLED_STYLE,
  },
  narrow: {
    title: 'Отмена',
    width: 160,
    border: true,
  },
  withPrependIcon: {
    title: 'Готово',
    border: true,
    width: 'auto' as const,
    prependIcon: ETU_BUTTON_STORY_ICON_CHECK,
  },
  pageHeaderExport: {
    title: 'Экспорт',
    ...ETU_BUTTON_PRIMARY_FILLED_STYLE,
    width: 'auto' as const,
  },
  pageHeaderRefresh: {
    title: 'Обновить',
    width: 'auto' as const,
  },
} as const;
