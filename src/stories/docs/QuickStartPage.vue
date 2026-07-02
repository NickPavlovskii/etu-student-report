<template>
  <article class="etu-docs-panel">
    <h1>Быстрый старт</h1>

    <h2>Приложение</h2>
    <pre><code>npm install
npm run dev          # http://localhost:5173
npm run build
npm run test</code></pre>
    <blockquote>
      Для работы с данными нужен бэкенд: в dev-режиме запросы к <code>/api</code> проксируются на
      <code>http://localhost:8081</code> (см. <code>vite.config.ts</code>).
    </blockquote>

    <h2>Storybook</h2>
    <pre><code>npm run storybook         # http://localhost:6006
npm run build-storybook   # storybook-static/</code></pre>
    <p>
      Превью компонентов обёрнуты в canvas-декораторы (<code>sb-canvas--light</code>) с фоном как в
      приложении (<code>#f4f6f9</code>). Документация и Autodocs используют тёмную тему UI в
      корпоративных цветах СПбГЭТУ.
    </p>

    <h2>Глобальная регистрация</h2>
    <pre v-pre><code>// main.ts
import GlobalComponents from '@/components/global'
app.use(GlobalComponents)</code></pre>
    <p>После этого компоненты доступны по тегам <code>etu-*</code> без импорта в шаблонах.</p>

    <h2>Декораторы в stories</h2>
    <pre v-pre><code>import { canvasLightMaxWidth, CANVAS_WIDTH } from '../helpers/decorators'

decorators: [canvasLightMaxWidth(CANVAS_WIDTH.compact)]</code></pre>
    <p>
      Хелперы в <code>src/stories/helpers/decorators.ts</code> — те же паттерны, что в проекте
      niklad: светлый/тёмный canvas, ограничение ширины, inline-центрирование.
    </p>
  </article>
</template>
