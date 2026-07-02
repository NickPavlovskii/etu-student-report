import type { Decorator } from '@storybook/vue3';
/** Типичные ширины превью в Storybook */
export const CANVAS_WIDTH = {
  compact: 360,
  card: 280,
  row: 720,
  section: 960,
  table: 1040,
} as const;

export const canvasDark: Decorator = () => ({
  template: '<div class="sb-canvas sb-canvas--padded sb-canvas--dark"><story /></div>',
});

export const canvasLight: Decorator = () => ({
  template: '<div class="sb-canvas sb-canvas--padded sb-canvas--light"><story /></div>',
});

export const canvasFullBleed: Decorator = () => ({
  template: '<div class="sb-canvas sb-canvas--full sb-canvas--light"><story /></div>',
});

export function maxWidth(px: number): Decorator {
  return () => ({
    template: `<div class="sb-canvas sb-canvas--padded sb-canvas--light" style="max-width: ${px}px; width: 100%"><story /></div>`,
  });
}

export function canvasLightMaxWidth(px: number): Decorator {
  return () => ({
    template: `<div class="sb-canvas sb-canvas--padded sb-canvas--light sb-canvas--inline" style="max-width: ${px}px; width: 100%"><story /></div>`,
  });
}

export function canvasDarkMaxWidth(px: number): Decorator {
  return () => ({
    template: `<div class="sb-canvas sb-canvas--padded sb-canvas--dark sb-canvas--inline" style="max-width: ${px}px; width: 100%"><story /></div>`,
  });
}
