# Стиль кода и форматирование

Инструкция по форматированию и правилам написания кода в проекте Student Works PWA.

---

## 1. Инструменты

- **ESLint** — проверка стиля и частичное автоисправление.
- **TypeScript** — типизация (Vue + TS).

### Команды

```bash
npm run lint        # проверка
npm run lint:fix    # проверка и автоисправление
```

Перед коммитом желательно запускать `npm run lint:fix`.

---

## 2. Общие правила (ESLint)

- **Длина строки**: не более **100** символов (`max-len: 100`). Длинные выражения разбивать на несколько строк.
- **Подчёркивание в именах**: запрещено, кроме:
  - свойств за `this` (например `this._private`);
  - аргументов, начинающихся с `_` (например `_unused`).
- **Параметры функций**: не переприсваивать параметры; можно мутировать их свойства (`props: false`).
- **Переносы строк**: без привязки к CRLF/LF (`linebreak-style: off`).

Используются наборы правил: Vue 3 Recommended, Airbnb (TypeScript), SonarJS, Import, TypeScript ESLint.

---

## 3. Vue

### 3.1. Компоненты (.vue)

- **Синтаксис**: предпочтительно `<script setup>`.
- **Порядок блоков**: `<template>`, `<script>`, `<style>` (при необходимости).
- **Стили**: по возможности `scoped` для компонентных стилей.

### 3.2. Имена компонентов

- **В коде (импорт, регистрация)**: PascalCase  
  Примеры: `DisciplineCard`, `EtuPageHeader`, `SemesterHalfSwitcher`.
- **В шаблоне**: kebab-case  
  Примеры: `<discipline-card>`, `<etu-page-header>`, `<semester-half-switcher>`.

### 3.3. Шаблон

- Атрибуты с длинным списком аргументов можно переносить на новые строки для укладывания в 100 символов.
- Обязательный атрибут `:key` в `v-for` с уникальным значением (например `item.id` или `item._key ?? item.CodeRow`).
- События: kebab-case, например `@check-all`, `@clear-all`, `@update:modelValue`.

### 3.4. Props и эмиты

- Props описывать через `defineProps()` (объект или TypeScript-типы).
- Эмиты — через `defineEmits()` с явным перечислением событий.
- Двусторонняя привязка: `v-model:propName` и эмит `update:propName`.

---

## 4. TypeScript / JavaScript

### 4.1. Именование

- **Переменные и функции**: camelCase (`search`, `semesterHalf`, `handleCheckAll`).
- **Константы**: camelCase или UPPER_SNAKE_CASE для глобальных/магических значений.
- **Типы и интерфейсы**: PascalCase (`DownloadFormat`, `ArchiveReportRow`).
- **Компоненты и composables (импорт)**: PascalCase для компонентов, camelCase для composables (рекомендуется единообразие: `useXxx` для хуков, например `useDisciplines`, `useAcademicYear`).

### 4.2. Импорты

- Абсолютные пути через алиас `@` для `src`:  
  `import { useUser } from '@/composables/useUser';`  
  `import type { ArchiveReportRow } from '@/types/reports';`
- Относительные — для файлов внутри того же модуля:  
  `import DisciplinesFilters from './components/Disciplinesfilters.vue';`
- Типы импортировать через `import type`, где возможно.

### 4.3. Файлы

- **API**: `src/api/` — функции запросов, типы ответов/запросов по домену (например `archive.ts`, `disciplines.ts`).
- **Composables**: `src/composables/` или `src/modules/<module>/composables/` — функции с префиксом `use` (например `useDisciplines`, `useAcademicYear`).
- **Типы**: общие в `src/types/` или рядом с модулем в `types.ts`.

---

## 5. Структура проекта

- **Модули**: по фичам в `src/modules/` (например `disciplines`, `archive`, `settings`, `discipline`).
- Внутри модуля:
  - страницы: `*Page.vue` (например `DisciplinesPage.vue`);
  - компоненты: папка `components/`;
  - логика: папка `composables/`;
  - типы: `types.ts` при необходимости.
- Общие компоненты: `src/components/` (в т.ч. `global/`, `sideBar/`).
- Роутинг: `src/router.ts`, API: `src/api/`.

---

## 6. Комментарии и документация

- Сложную логику и неочевидные решения пояснять комментариями на русском или английском.
- JSDoc для публичных функций и типов при необходимости.
- Длинные комментарии можно разбивать на несколько строк в пределах 100 символов.

---

## 7. Сводка

| Элемент              | Правило |
|----------------------|--------|
| Длина строки         | ≤ 100 символов |
| Компоненты (имя)     | PascalCase в коде, kebab-case в шаблоне |
| Переменные/функции   | camelCase |
| Типы/интерфейсы      | PascalCase |
| Импорты из src       | алиас `@` |
| Composables          | префикс `use`, camelCase |
| Стили в Vue          | предпочтительно `scoped` |
if() {
  
} 
| Линтинг              | `npm run lint:fix` перед коммитом |

При расхождении с этой инструкцией приоритет имеют настройки ESLint и TypeScript в репозитории (`.eslintrc.json`, `tsconfig*.json`).
